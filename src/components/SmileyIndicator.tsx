type Props = {
   verdi: number;
 };
 
 export default function SmileyIndicator({ verdi }: Props) {
   let filnavn = "";
 
   if (verdi <= 2) {
     filnavn = "1-2.png";
   } else if (verdi <= 4) {
     filnavn = "3-4.png";
   } else if (verdi <= 6) {
     filnavn = "5-6.png";
   } else if (verdi <= 8) {
     filnavn = "7-8.png";
   } else {
     filnavn = "9-10.png";
   }
 
   return (
     <div className="w-24 h-24" title={`Smerteverdi: ${verdi}`}>
       <img
         src={`/smerte/${filnavn}`}
         alt={`Smiley for smerteverdi ${verdi}`}
         className="w-full h-full object-contain"
       />
     </div>
   );
 }
 