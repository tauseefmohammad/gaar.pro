import Image from "next/image";
const Logo = () => {
  return (
    <div className="flex gap-3 justify-between md:justify-normal items-center pt-8 ml-1">
      <div>
        <Image src={"/gaar-logo.svg"} alt="Logo" width={200} height={150} />
      </div>
    </div>
  );
};

export default Logo;
