import * as icons from "@design-system/icons";

type IconComponent = (typeof icons)["PlusIcon"];

/** Every exported `*Icon`, rendered with the same sizing API consumers use. */
export function IconGallery() {
  const entries = Object.entries(icons).filter(([name]) => name.endsWith("Icon")) as [
    string,
    IconComponent,
  ][];
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-md">
      {entries.map(([name, Icon]) => (
        <li
          key={name}
          className="flex flex-col items-center gap-sm rounded-surface border border-border-default p-md text-sm"
        >
          <Icon size={24} />
          <code className="text-xs">{name}</code>
        </li>
      ))}
    </ul>
  );
}
