/** Drizzle örneğinin DI token'ı. Repository'ler somut sınıfa değil bu token'a bağlanır. */
export const DRIZZLE = Symbol('DRIZZLE');

/** Alttaki pg Pool — yalnızca sağlık kontrolü ve kapanış için. */
export const PG_POOL = Symbol('PG_POOL');
