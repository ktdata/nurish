import React, { useState } from 'react';
import { BookOpen, Utensils, Heart, Shield, Sparkles, ChefHat, MapPin, ExternalLink } from 'lucide-react';
import { MicroCopyBanner } from './MicroCopyBanner';

export const CommunityResources: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'recipes' | 'fridges' | 'rights'>('recipes');

  const recipes = [
    {
      title: 'Skillet Sweet Potato & Black Bean Hash',
      prepTime: '20 mins',
      servings: '4 servings',
      cost: '$0 (100% Pantry Staples)',
      ingredients: [
        '2 sweet potatoes, cubed',
        '1 can black beans, drained & rinsed',
        '1 bell pepper or greens from farm box',
        '1 tsp cumin & chili powder',
        '2 tbsp cooking oil, salt & pepper to taste'
      ],
      instructions:
        'Sauté sweet potato cubes in hot skillet with oil until fork tender (8-10 mins). Stir in spices and drained black beans. Fold in fresh chopped greens in the final 2 minutes. Serve warm with corn tortillas or a fried egg.'
    },
    {
      title: 'Golden Coconut Lentil & Spinach Stew',
      prepTime: '25 mins',
      servings: '5 servings',
      cost: '$0 (Pantry Box Staples)',
      ingredients: [
        '1 cup dry brown or red lentils',
        '1 can coconut milk or broth',
        '1 can diced tomatoes',
        '2 big handfuls of pantry fresh spinach or chard',
        '1 tsp turmeric & garlic powder'
      ],
      instructions:
        'Simmer lentils with tomatoes, spices and 2 cups water until lentils are soft (15-20 mins). Pour in coconut milk and fold in fresh spinach until wilted. High in iron, fiber, and soothing comfort.'
    },
    {
      title: 'Farmers Market Garden Sauté with Pasta',
      prepTime: '15 mins',
      servings: '4 servings',
      cost: '$0 (Produce Box)',
      ingredients: [
        '8 oz pasta or rice noodles',
        'Assorted seasonal farm veggies (zucchini, carrots, tomatoes)',
        '2 tbsp olive oil or butter',
        'Grated cheese or nutritional yeast'
      ],
      instructions:
        'Boil pasta until al dente. In a separate skillet, quickly sear sliced veggies with olive oil, salt, and garlic. Toss warm pasta together with veggies and top with cheese. Delicious, vibrant, and quick.'
    }
  ];

  const fridges = [
    {
      name: 'Orlando Community Fridge (Downtown / Mills 50)',
      location: '1012 N. Mills Ave, Orlando, FL 32803',
      access: 'Open 24 hours, 7 days a week',
      stock: 'Fresh Florida produce, boxed meals, cold spring water, artisan bread',
      rule: 'Take what you need, leave what you can. No questions asked.'
    },
    {
      name: 'Parramore Solidarity Cooler',
      location: '520 W. South Street, Orlando, FL 32805',
      access: 'Open 7:00 AM – 9:00 PM Daily',
      stock: 'Local farm citrus, baby formula, shelf-stable milk, cold drinks',
      rule: 'Outdoor sheltered mutual aid box with solar lights.'
    },
    {
      name: 'Pine Hills Free Bread & Produce Stand',
      location: '4800 Silver Star Road, Orlando, FL 32808',
      access: 'Open 24 hours daily',
      stock: 'Daily bakery rescues, seasonal vegetables, canned beans and tuna',
      rule: 'Completely free self-serve community shelf.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-[#1E5128]/10 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-[#E8EFE9] text-[#1E5128] flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#111C2D]">
              Community Kitchen & Mutual Aid Guide
            </h2>
            <p className="text-xs sm:text-sm text-[#414940]">
              Wholesome staple recipes, 24/7 mutual aid fridges, and recipient rights.
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#E8EFE9]">
          <button
            onClick={() => setActiveCategory('recipes')}
            className={`min-h-[44px] px-5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'recipes'
                ? 'bg-[#1E5128] text-white shadow-xs'
                : 'bg-[#F4F7F4] text-[#414940] hover:bg-[#E8EFE9]'
            }`}
          >
            Pantry Staple Recipes
          </button>
          <button
            onClick={() => setActiveCategory('fridges')}
            className={`min-h-[44px] px-5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'fridges'
                ? 'bg-[#1E5128] text-white shadow-xs'
                : 'bg-[#F4F7F4] text-[#414940] hover:bg-[#E8EFE9]'
            }`}
          >
            24/7 Free Community Fridges
          </button>
          <button
            onClick={() => setActiveCategory('rights')}
            className={`min-h-[44px] px-5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'rights'
                ? 'bg-[#1E5128] text-white shadow-xs'
                : 'bg-[#F4F7F4] text-[#414940] hover:bg-[#E8EFE9]'
            }`}
          >
            Recipient Rights & Dignity
          </button>
        </div>
      </div>

      {/* Category: Recipes */}
      {activeCategory === 'recipes' && (
        <div className="space-y-4">
          <MicroCopyBanner
            icon="sun"
            text="Cook delicious, hearty meals using only what comes in your food box."
            subtext="These recipes are designed by community cooks to require zero fancy kitchen gadgets and minimal prep time."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recipes.map((recipe, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-[#1E5128]/10 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#D97706] font-bold mb-2">
                    <span className="flex items-center gap-1">
                      <ChefHat className="w-3.5 h-3.5" />
                      {recipe.prepTime}
                    </span>
                    <span className="bg-[#FEF3C7] px-2 py-0.5 rounded-full text-[#92400E]">
                      {recipe.servings}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-[#111C2D] mb-3 leading-snug">
                    {recipe.title}
                  </h3>

                  <div className="mb-3">
                    <p className="text-[11px] font-bold text-[#71796F] uppercase tracking-wider mb-1">
                      Pantry Box Ingredients:
                    </p>
                    <ul className="text-xs text-[#414940] space-y-1">
                      {recipe.ingredients.map((ing, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-[#1E5128] font-bold">•</span>
                          <span>{ing}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-[#F1F5F9]">
                    <p className="text-[11px] font-bold text-[#71796F] uppercase tracking-wider mb-1">
                      Simple Instructions:
                    </p>
                    <p className="text-xs text-[#414940] leading-relaxed">
                      {recipe.instructions}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F1F5F9] text-center">
                  <span className="text-xs font-bold text-[#15803D] bg-[#DCFCE7] px-3 py-1 rounded-full">
                    {recipe.cost}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category: Community Fridges */}
      {activeCategory === 'fridges' && (
        <div className="space-y-4">
          <MicroCopyBanner
            icon="heart"
            text="Mutual aid fridges are stocked by neighbors and local grocers daily."
            subtext="Available at all hours of the day or night. Never locked, no gatekeeper, completely unconditional."
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {fridges.map((f, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-[#1E5128]/10 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-full bg-[#E8EFE9] text-[#1E5128] flex items-center justify-center mb-3">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-[#111C2D]">{f.name}</h3>
                  <p className="text-xs font-bold text-[#1E5128] mt-1">{f.location}</p>
                  <p className="text-xs text-[#414940] mt-2 font-medium">{f.access}</p>

                  <div className="mt-3 pt-3 border-t border-[#F1F5F9] text-xs space-y-1 text-[#414940]">
                    <p><strong>Stocked with:</strong> {f.stock}</p>
                    <p className="text-[#71796F] italic">"{f.rule}"</p>
                  </div>
                </div>

                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(f.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 min-h-[44px] rounded-full border border-[#1E5128] text-[#1E5128] text-xs font-bold hover:bg-[#E8EFE9] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Navigate to Fridge</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category: Recipient Rights */}
      {activeCategory === 'rights' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#1E5128]/10 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DCFCE7] text-[#166534] flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#111C2D]">
                Your Rights as a Community Food Recipient
              </h3>
              <p className="text-xs text-[#414940]">
                Every pantry and mutual aid program in our network adheres to these non-negotiable principles.
              </p>
            </div>
          </div>

          <div className="space-y-3.5 pt-2 text-sm text-[#414940]">
            <div className="p-4 rounded-xl bg-[#F4F7F4] border border-[#CBD5E1]">
              <h4 className="font-bold text-[#111C2D] mb-1">1. Unconditional Access (Zero Document Requirement)</h4>
              <p className="text-xs leading-relaxed">
                You are never required to show government ID, proof of income, citizenship documents, social security numbers, or utility bills to receive emergency groceries.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F4F7F4] border border-[#CBD5E1]">
              <h4 className="font-bold text-[#111C2D] mb-1">2. Absolute Privacy & Immigration Protection</h4>
              <p className="text-xs leading-relaxed">
                Using food pantries and SNAP benefits does NOT count against "Public Charge" and will never jeopardize residency, DACA, green card applications, or citizenship.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F4F7F4] border border-[#CBD5E1]">
              <h4 className="font-bold text-[#111C2D] mb-1">3. Right to Respectful & Dignified Service</h4>
              <p className="text-xs leading-relaxed">
                Volunteers and organizers are here to serve with kindness, warm hospitality, and gratitude. You have the right to request food that respects your religious dietary traditions and medical requirements.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
