module main where

open import Subdir.r0

data not (X : Set) : Set where
    not-intro : (X -> ⊥) -> not X
