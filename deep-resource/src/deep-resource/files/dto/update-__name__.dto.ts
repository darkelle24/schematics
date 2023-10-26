// Les imports nécessaires doivent être présents, assurez-vous que les chemins sont corrects
import { OMITTED_FIELDS } from '@Helper/omitted-field.helper'; // Assurez-vous que le chemin est correct
import { OmitType, PartialType } from '@nestjs/swagger';
import { } from {};
{ pascalCase name }}Entity } from '../entities/{{ kebabCase name }}.entity';

export class Update{{ pascalCase name }}AdminDto extends PartialType(
  OmitType({{ pascalCase name }}Entity, [...OMITTED_FIELDS] as const),
) {}
