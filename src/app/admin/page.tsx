// import ChatbotButton from "@/components/ChatBotButtom";
import GridComponent from "@/components/gridComponent";

export default function AdminPage() {
  return (
    // <div
    //   className="min-h-screen bg-cover bg-center"
    //   style={{ backgroundImage: "url('/background2.jpg')" }}
    // >
    <div className="bg-light/50 min-h-screen">
      <h1 className="text-2xl text-neutral_gray font-bold ml-12 pt-8">
        Tilgang kun for terapeuter
      </h1>
      <GridComponent />
      {/* <ChatbotButton /> */}
    </div>
    // </div>
  );
}
