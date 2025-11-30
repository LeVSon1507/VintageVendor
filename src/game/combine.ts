import { RecipeDefinition, RECIPE_CATALOG } from './recipes';

function sortIds(ids: string[]): string[] {
  return [...ids].sort();
}

function idsOfRecipe(recipe: RecipeDefinition): string[] {
  return recipe.ingredients.map(function toId(ingredient) {
    return ingredient.id;
  });
}

export function compileSelectedDish(selectedIngredientIds: string[]): RecipeDefinition | undefined {
  const selected = sortIds(selectedIngredientIds);
  for (const recipe of RECIPE_CATALOG) {
    const target = sortIds(idsOfRecipe(recipe));
    if (selected.length === target.length && selected.every(function eq(id, index) { return id === target[index]; })) {
      return recipe;
    }
  }
  return undefined;
}

