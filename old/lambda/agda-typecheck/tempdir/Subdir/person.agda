module Subdir.person where

open import Agda.Builtin.String
open import Agda.Builtin.Nat

{-  /////////////////////////
    Define general types
    /////////////////////////-}
record Date : Set where
    field
        month : Nat
        day : Nat
        year : Nat

record Person : Set where
    field
        name : String
        dob  : Date
