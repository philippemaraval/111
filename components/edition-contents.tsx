import { BookOpenText, CircleDot, Shirt, Sticker } from "lucide-react";

const editionContents = [
  {
    icon: Shirt,
    number: "01",
    title: "Le tee‑shirt 111",
    text: "Le visuel original consacré au quartier, imaginé et imprimé à Marseille."
  },
  {
    icon: CircleDot,
    number: "02",
    title: "Le sticker 111",
    text: "Le rond signature de la marque, dans un format de 5 cm."
  },
  {
    icon: Sticker,
    number: "03",
    title: "Le sticker du quartier",
    text: "Un format de 7,5 cm qui reprend le logo poitrine de l’édition."
  },
  {
    icon: BookOpenText,
    number: "04",
    title: "La carte du quartier",
    text: "Une carte cartonnée qui raconte son identité, les monuments du dessin et les raisons de leur sélection."
  }
];

export function EditionContents() {
  return (
    <section
      data-testid="edition-contents"
      className="bg-navy px-4 py-10 text-white sm:px-6 sm:py-16 lg:py-24"
      aria-labelledby="edition-111-title"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="grid gap-5 sm:gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-sun">L’édition de quartier</p>
            <h2 id="edition-111-title" className="mt-2 max-w-xl text-3xl font-black uppercase leading-[0.95] tracking-[-0.04em] sm:mt-3 sm:text-6xl">Bien plus qu’un tee‑shirt.</h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-white/65 sm:mt-5 sm:text-base sm:leading-7">Chaque tee‑shirt 111 est une petite édition consacrée à un quartier de Marseille : une pièce à porter, deux stickers et une histoire à collectionner.</p>
          </div>

          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[20px] bg-white/15 sm:rounded-[24px]">
            {editionContents.map((item) => (
              <article key={item.number} className="bg-navy p-4 sm:p-7">
                <div className="flex items-center justify-between">
                  <item.icon className="h-5 w-5 text-sun sm:h-6 sm:w-6" aria-hidden="true" />
                  <span className="text-[10px] font-black tracking-[0.18em] text-white/30 sm:text-xs">{item.number}</span>
                </div>
                <h3 className="mt-4 text-base font-black leading-tight sm:mt-8 sm:text-xl">{item.title}</h3>
                <p className="mt-2 hidden text-sm leading-6 text-white/60 sm:block">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
        <p className="mt-5 border-t border-white/15 pt-4 text-xs font-bold leading-5 text-white/75 sm:mt-8 sm:pt-6 sm:text-sm">Chaque tee‑shirt commandé est accompagné de ses stickers et de sa carte de quartier.</p>
      </div>
    </section>
  );
}
