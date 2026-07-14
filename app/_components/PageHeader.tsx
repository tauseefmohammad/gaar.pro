export default function PageHeader({ title }: { title: string }) {
  return (
    <div className="bg-linear-to-r from-cyan-300 to-cyan-900 text-white text-center py-2 font-semibold rounded-md">
      {title}
    </div>
  )
}