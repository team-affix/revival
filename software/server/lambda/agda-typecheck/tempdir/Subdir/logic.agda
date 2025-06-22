module Subdir.logic where

data ⊥ : Set where

data not (X : Set) : Set where
    not-intro : (X -> ⊥) -> not X

data _or_ (X Y : Set) : Set where
    linj : X -> X or Y
    rinj : Y -> X or Y

data _and_ (X Y : Set) : Set where
    conj : X -> Y -> X and Y

postulate
    absurd : {X : Set} -> X -> not X -> ⊥
