module Countries.main where

open import Data.Nat
open import Data.String
record Country : Set where
    field
        name : String
        capital : String
        population : ℕ
        area : ℕ

uruguay : Country
uruguay = record { name = "Uruguay" ; capital = "Montevideo" ; population = 3473727 ; area = 176215 }

brazil : Country
brazil = record { name = "Brazil" ; capital = "Brasília" ; population = 212559409 ; area = 8515767 }
