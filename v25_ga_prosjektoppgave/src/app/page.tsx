import MaxWidthWrapper from "@/components/MaxWidthWrapper";


export default function Home() {
  return (
    <MaxWidthWrapper>
      <div className="py-20 mx-auto text-center flex flex-col  items-center max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">Fysioteapeut <span className="text-red-600 ">Admin side</span></h1>
        <p className="mt-6 text-lg max-w-prose text-muted-foreground">Hold kontakt med paienter, få hjelp til journalskriving og frigjør din tid.</p>
      </div>
    </MaxWidthWrapper>
  );
}
