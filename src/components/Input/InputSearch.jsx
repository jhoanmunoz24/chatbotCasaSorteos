import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { SearchIcon } from 'lucide-react';

export function InputSearch() {
  return (
    <Field className="max-w-sm min-w-2xs">
      
      <InputGroup>
        <InputGroupInput id="inline-start-input" placeholder="Buscar Cliente,Telefono,Boleta..." />
        <InputGroupAddon align="inline-start">
          <SearchIcon className="text-muted-foreground" />
        </InputGroupAddon>
      </InputGroup>
      
    </Field>
  );
}
