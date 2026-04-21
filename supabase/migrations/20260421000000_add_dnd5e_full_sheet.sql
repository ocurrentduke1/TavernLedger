-- D&D 5e Complete Character Sheet Fields

-- Identity & classification
ALTER TABLE characters ADD COLUMN IF NOT EXISTS subclass text;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS dnd_background text;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS xp integer DEFAULT 0;

-- Combat statistics
ALTER TABLE characters ADD COLUMN IF NOT EXISTS ac integer DEFAULT 10;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS speed integer DEFAULT 30;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS size text DEFAULT 'Medium';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS shield boolean DEFAULT false;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS hp_temp integer DEFAULT 0;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS hit_dice text DEFAULT 'd8';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS hit_dice_spent integer DEFAULT 0;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS death_saves_success integer DEFAULT 0;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS death_saves_failure integer DEFAULT 0;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS heroic_inspiration boolean DEFAULT false;

-- Saving throw proficiencies
ALTER TABLE characters ADD COLUMN IF NOT EXISTS save_prof_strength boolean DEFAULT false;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS save_prof_dexterity boolean DEFAULT false;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS save_prof_constitution boolean DEFAULT false;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS save_prof_intelligence boolean DEFAULT false;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS save_prof_wisdom boolean DEFAULT false;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS save_prof_charisma boolean DEFAULT false;

-- Skill proficiencies (18 skills)
ALTER TABLE characters ADD COLUMN IF NOT EXISTS skill_acrobatics boolean DEFAULT false;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS skill_animal_handling boolean DEFAULT false;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS skill_arcana boolean DEFAULT false;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS skill_athletics boolean DEFAULT false;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS skill_deception boolean DEFAULT false;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS skill_history boolean DEFAULT false;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS skill_insight boolean DEFAULT false;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS skill_intimidation boolean DEFAULT false;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS skill_investigation boolean DEFAULT false;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS skill_medicine boolean DEFAULT false;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS skill_nature boolean DEFAULT false;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS skill_perception boolean DEFAULT false;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS skill_performance boolean DEFAULT false;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS skill_persuasion boolean DEFAULT false;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS skill_religion boolean DEFAULT false;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS skill_sleight_of_hand boolean DEFAULT false;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS skill_stealth boolean DEFAULT false;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS skill_survival boolean DEFAULT false;

-- Equipment & proficiency training
ALTER TABLE characters ADD COLUMN IF NOT EXISTS armor_training text;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS weapon_proficiencies text;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS tool_proficiencies text;

-- Character content
ALTER TABLE characters ADD COLUMN IF NOT EXISTS class_features jsonb DEFAULT '[]'::jsonb;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS species_traits text;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS feats text;

-- Weapons: add attack bonus to inventory items
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS attack_bonus text;
