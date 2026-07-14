import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import TransactionInfo from "@/models/TransactionInfo";
import PaymentInfo from "@/models/PaymentInfo";
import ReceivableInfo from "@/models/ReceivableInfo";
import TenderInfo from "@/models/TenderInfo";
import WorkOrder from "@/models/WorkOrder";
import FundRequest from "@/models/FundRequest";

export async function POST(req) {
  const body = await req.json();
  console.log("After passing data to constants");

  try {
    await connectDB();
    //console.log("After connecting to db");
    //const clientNameWithNoSpaces = client.replace(/\s/g,'');
    const orgId = body.orgId;
    const createdTxn = await TransactionInfo.create(body);
    console.log(createdTxn);
    if (createdTxn) {
      if (body.entityType === "PAYMENT") {
        console.log("Body Amount: ", body.amount);
        const paymentData = await PaymentInfo.findById(body.entityId);
        const balanceAmount =
          Number(paymentData.balanceAmount) - Number(body.amount);
        // const paidAmount = Number(paymentData.paidAmount || 0) + body.amount;

        console.log("Balance Amount after Update: ", balanceAmount);
        let paymentStatus = "Partially Paid";
        if (Number(balanceAmount) <= 0) {
          paymentStatus = "Paid";
        }

        const up = await PaymentInfo.findByIdAndUpdate(
          body.entityId,
          {
            $inc: {
              balanceAmount: -body.amount,
              paidAmount: +body.amount,
            },
            $set: {
              status: paymentStatus,
            },
          },
          { returnDocument: "after" },
        );

        if (up) {
          /** Update Fund Request status so that it reflects the payment status */
          console.log("Payment Status: ", paymentStatus);
          console.log("OrgId: ", orgId);
          const updatedFundRequest = await FundRequest.findOneAndUpdate(
            {
              frNo: up.requestNo,
              orgId: orgId,
            },
            {
              status: paymentStatus,
            },
            { returnDocument: "after" },
          );
          console.log("Updated Fund Request: ", updatedFundRequest);
        }
        /** Update Tender if payment is made against any Tender Payments */
        if (
          up.paymentType === "BG" ||
          up.paymentType === "EMD" ||
          up.paymentType === "Transaction Fee" ||
          up.paymentType === "Corpus Fund" ||
          up.paymentType === "Document Fee"
        ) {
          console.log(
            "Updating tender information for payment type: ",
            up.paymentType,
          );
          if (up.paymentType === "BG") {
            await TenderInfo.findOneAndUpdate(
              {
                tenderNo: up.tenderNo,
                orgId: orgId,
              },
              {
                bgPaymentDate: createdTxn.txnDate,
                bgPaymentStatus: paymentStatus,
              },
            );
          }
          if (up.paymentType === "EMD") {
            await TenderInfo.findOneAndUpdate(
              {
                tenderNo: up.tenderNo,
                orgId: orgId,
              },
              {
                emdPaymentDate: createdTxn.txnDate,
                emdPaymentStatus: paymentStatus,
              },
            );
          }
          if (up.paymentType === "Transaction Fee") {
            await TenderInfo.findOneAndUpdate(
              {
                tenderNo: up.tenderNo,
                orgId: orgId,
              },
              {
                transactionFeePaymentDate: createdTxn.txnDate,
                transactionFeePaymentStatus: paymentStatus,
              },
            );
          }
          if (up.paymentType === "Corpus Fund") {
            await TenderInfo.findOneAndUpdate(
              {
                tenderNo: up.tenderNo,
                orgId: orgId,
              },
              {
                corpusFundPaymentDate: createdTxn.txnDate,
                corpusFundPaymentStatus: paymentStatus,
              },
            );
          }
          if (up.paymentType === "Document Fee") {
            await TenderInfo.findOneAndUpdate(
              {
                tenderNo: up.tenderNo,
                orgId: orgId,
              },
              {
                documentFeePaymentDate: createdTxn.txnDate,
                documentFeePaymentStatus: paymentStatus,
              },
            );
          }
        }

        console.log("Updated Payment: ", up);
        if (up.paymentType === "BG" || up.paymentType === "EMD") {
          console.log("Balance Amount: ", up.balanceAmount);
          console.log("Payment Type: ", up.paymentType);
          if (Number(up.balanceAmount) === 0) {
            console.log("Creating receivable entry for BG/EMD payment...");

            await ReceivableInfo.create({
              type: up.paymentType,
              woNo: up.woNo,
              woTitle: up.woTitle,
              description: up.description,
              receivableAmount: up.requestAmount,
              balanceReceivableAmount: up.requestAmount,
              receivedAmount: 0,
              vertical: up.vertical,
              subVertical: up.subVertical,
              paymentFrom: up.paymentTo,
              owner: "System",
              status: "Pending",
              receivedDate: up.receivedDate,
              invoiceNo: null,
              dueDate: null,
              tenderNo: up.tenderNo,
              tenderDesc: up.tenderDesc,
              state: up.state,
              orgId: up.orgId,
            });
            console.log("Receivable entry created successfully!");
          }
        }
      } else if (body.entityType === "RECEIVABLE") {
        const receivableData = await ReceivableInfo.findById(body.entityId);

        const balanceReceivableAmount =
          Number(receivableData.balanceReceivableAmount || 0) - body.amount;

        const receivedAmount =
          Number(receivableData.receivedAmount || 0) + body.amount;

        let receivableStatus = "Pending";

        // Fully received
        if (Number(balanceReceivableAmount) <= 0) {
          receivableStatus = "Received";
        }

        // Partially received
        else if (
          Number(balanceReceivableAmount) > 0 &&
          Number(receivedAmount) > 0
        ) {
          receivableStatus = "Partially Received";
        }

        const updatedReceivable = await ReceivableInfo.findByIdAndUpdate(
          body.entityId,
          {
            $inc: {
              balanceReceivableAmount: -body.amount,
              receivedAmount: +body.amount,
            },
            $set: {
              status: receivableStatus,
              receivedDate: createdTxn.txnDate || new Date(),
            },
          },
          { returnDocument: "after" },
        );
        /** If BG or EMD is Received fully update TenderInfo emdRefundStatus as Received or
         * bgRefundStatus as Received based on type
         * and WorkOrderInfo's bgReceivedStatus as Received
         *
         */
        console.log("Updated Receivable: ", updatedReceivable);
        if (
          updatedReceivable.type === "BG" ||
          updatedReceivable.type === "EMD"
        ) {
          console.log("Inside if receivable type is BG or EMD");
          if (
            updatedReceivable.type === "BG" &&
            receivableStatus === "Received"
          ) {
            console.log("updatedReceivable type: ", updatedReceivable.type);
            /** Find the corresponding work order and update bgRefundStatus and bgRefundDate */
            await TenderInfo.findOneAndUpdate(
              {
                tenderNo: updatedReceivable.tenderNo,
                orgId: orgId,
              },
              {
                $set: {
                  bgRefundStatus: "Refunded",
                  bgRefundDate: updatedReceivable.receivedDate,
                },
              },
              { returnDocument: "after" },
            );
            await WorkOrder.findOneAndUpdate(
              { woNo: updatedReceivable.woNo, orgId: orgId },
              { bgReceivedStatus: "Refunded" },
              { returnDocument: "after" },
            );
          }
          if (
            updatedReceivable.type === "EMD" &&
            receivableStatus === "Received"
          ) {
            await TenderInfo.findOneAndUpdate(
              { tenderNo: updatedReceivable.tenderNo, orgId: orgId },
              {
                $set: {
                  emdRefundStatus: "Refunded",
                  emdRefundDate: updatedReceivable.receivedDate,
                },
              },
              { returnDocument: "after" },
            );
          }
        }
        console.log(
          "Receivable transaction created successfully!",
          updatedReceivable,
        );
      }
    }
    return NextResponse.json({ message: "Success!" }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Something went wrong!" },
      { status: 500 },
    );
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");

    console.log("Org Id: " + orgId);

    const [txns, total] = await Promise.all([
      TransactionInfo.find({ entityId }),
    ]);
    console.log("Transactions: ", txns);
    return NextResponse.json(
      {
        data: txns,
      },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      { message: "Something went wrong!" },
      { status: 500 },
    );
  }
}

/**
 * Method to Update a client
 * @returns M
 */
export async function PATCH(req) {
  const { client, website, emailId, phone, gstNo, orgId } = await req.json();
  try {
    return NextResponse.json(
      { message: "Successfully saved Client!" },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      { message: "Something went wrong!" },
      { status: 500 },
    );
  }
}
