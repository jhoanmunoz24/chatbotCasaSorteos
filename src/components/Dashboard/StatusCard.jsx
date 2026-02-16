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
        <ItemContent className={'text-foreground flex flex-col gap-2'}>
          <div className="flex justify-between items-start">
            <ItemTitle className={'text-lg flex-1'}>{title}</ItemTitle>
            <ItemMedia variant="icon" className="ml-2">{icon}</ItemMedia>
          </div>
          <ItemDescription className={'text-4xl'}>{number}</ItemDescription>
        </ItemContent>
      </Item>
    </div>
  );
}
