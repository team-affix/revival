module Default.Absurdity where

data ⊥ : Set where

¬ : Set → Set
¬ A = A → ⊥

contradiction : ∀ {A : Set} → A → ¬ A → ⊥
contradiction a na = na a
