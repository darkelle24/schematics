import {
  Rule,
  SchematicContext,
  Tree,
  apply,
  url,
  template,
  move,
  chain,
  MergeStrategy,
  mergeWith,
} from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';

// Vous pouvez recevoir des options de la ligne de commande qui peuvent être définies dans un modèle d'interface
export interface MySchematicOptions {
  name: string;
  path: string;
  file: boolean;
}

export function deepResource(options: MySchematicOptions): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const templateSource = apply(
      url('./files'), // chemin vers vos fichiers de modèle
      [
        template({
          ...strings, // utilise des helpers comme `dasherize`
          ...options,
        }),
        move(`src/${strings.dasherize(options.path)}/${strings.dasherize(options.name)}`),
      ]
    );

    // Cette règle fusionne le Tree du template avec le Tree de destination
    const rule = mergeWith(templateSource, MergeStrategy.Default);
    return chain([rule])(tree, _context);
  };
}
