import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';

export function ItemVariant({ title, number, icon }) {
  return (
    <div className="flex w-full max-w-md flex-col gap-6 bg-card ">
      <Item size="default" variant="outline">
        <ItemContent>
          <ItemTitle>{title}</ItemTitle>
          <ItemDescription>{number}</ItemDescription>
          <ItemMedia variant="icon">{icon}</ItemMedia>
        </ItemContent>
      </Item>
    </div>
  );
}
