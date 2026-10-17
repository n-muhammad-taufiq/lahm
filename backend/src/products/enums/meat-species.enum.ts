export enum MeatSpecies {
  // Bovine (Cattle & Buffalo)
  BEEF = 'BEEF', // Prime Cattle / Japanese Halal Wagyu / Chinese Beef (牛肉)
  BUFFALO = 'BUFFALO', // Carabeef / Bhains (Vital for India legal compliance)
  VEAL = 'VEAL', // Young calf

  // Small Ruminants (Mutton)
  GOAT = 'GOAT', // Chevon (Bakra) - Indian & South Asian top preference
  LAMB = 'LAMB', // Tender sheep - Chinese (羊肉) & Middle Eastern top preference

  // Poultry & Halal Birds
  CHICKEN = 'CHICKEN', // Broiler, Desi country chicken, Japanese Jidori, Chinese Sanhuangji
  DUCK = 'DUCK', // Crucial for Chinese & Japanese halal diners
  QUAIL = 'QUAIL', // Batair (South Asia) / Uzura (Japan)
  PIGEON_SQUAB = 'PIGEON_SQUAB', // Halal squab (Chinese Qingzhen & Egyptian delicacy)

  // Desert Ruminant
  CAMEL = 'CAMEL', // Specialty Arab / Gulf cut

  // Finfish (Scaled fish only - Samak)
  FISH = 'FISH', // Scaled fish (Indian Rohu/Pomfret, Japanese Salmon/Tai, Chinese Sea Bass)
}
