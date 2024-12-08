const Page = ({
  children,
}: {
  children: React.ReactNode | React.ReactNode[]
}) => {
  return <div className="max-w-xl mx-auto mt-10 space-y-6">{children}</div>
}

export default Page
