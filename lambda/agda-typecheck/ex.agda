module ex where

data ⊥ : Set where

data not (X : Set) : Set where
    not-intro : (X -> ⊥) -> not X
