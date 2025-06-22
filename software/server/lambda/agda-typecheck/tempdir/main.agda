module main where

open import Subdir.logic
open import Subdir.person
open import Agda.Primitive

jakes-birthday : Date
jakes-birthday = record { month = 8; day = 29; year = 2002 }

jake : Person
jake = record { name = "Jake"; dob = jakes-birthday }
