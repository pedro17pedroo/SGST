/**
 * Classe base abstrata para delegação de métodos de storage
 * Elimina duplicação de código nos métodos CRUD padrão
 */
export abstract class BaseStorageDelegate<T, TInsert, TUpdate = Partial<TInsert>> {
  protected abstract getModuleName(): string;
  protected abstract getModule(): any;

  /**
   * Método genérico para obter todos os registros
   */
  protected async getAll(): Promise<T[]> {
    return this.getModule().getAll ? this.getModule().getAll() : this.getModule()[`get${this.getModuleName()}s`]();
  }

  /**
   * Método genérico para obter um registro por ID
   */
  protected async getById(id: string): Promise<T | undefined> {
    return this.getModule().getById ? this.getModule().getById(id) : this.getModule()[`get${this.getModuleName()}`](id);
  }

  /**
   * Método genérico para criar um registro
   */
  protected async create(data: TInsert): Promise<T> {
    return this.getModule().create ? this.getModule().create(data) : this.getModule()[`create${this.getModuleName()}`](data);
  }

  /**
   * Método genérico para atualizar um registro
   */
  protected async update(id: string, data: TUpdate): Promise<T> {
    const result = this.getModule().update ? this.getModule().update(id, data) : this.getModule()[`update${this.getModuleName()}`](id, data);
    if (!result) {
      throw new Error(`${this.getModuleName()} não encontrado`);
    }
    return result;
  }

  /**
   * Método genérico para deletar um registro
   */
  protected async delete(id: string): Promise<void> {
    return this.getModule().delete ? this.getModule().delete(id) : this.getModule()[`delete${this.getModuleName()}`](id);
  }

  /**
   * Método genérico para buscar registros
   */
  protected async search(query: string): Promise<T[]> {
    return this.getModule().search ? this.getModule().search(query) : this.getModule()[`search${this.getModuleName()}s`](query);
  }
}

/**
 * Interface para padronizar operações CRUD
 */
export interface CrudOperations<T, TInsert, TUpdate = Partial<TInsert>> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | undefined>;
  create(data: TInsert): Promise<T>;
  update(id: string, data: TUpdate): Promise<T>;
  delete(id: string): Promise<void>;
  search?(query: string): Promise<T[]>;
}

/**
 * Utilitário para criar delegadores padrão
 */
export function createStandardDelegate<T, TInsert, TUpdate = Partial<TInsert>>(
  moduleName: string,
  moduleGetter: () => any
): CrudOperations<T, TInsert, TUpdate> {
  return {
    async getAll(): Promise<T[]> {
      const module = moduleGetter();
      return module[`get${moduleName}s`] ? module[`get${moduleName}s`]() : module.getAll();
    },

    async getById(id: string): Promise<T | undefined> {
      const module = moduleGetter();
      return module[`get${moduleName}`] ? module[`get${moduleName}`](id) : module.getById(id);
    },

    async create(data: TInsert): Promise<T> {
      const module = moduleGetter();
      return module[`create${moduleName}`] ? module[`create${moduleName}`](data) : module.create(data);
    },

    async update(id: string, data: TUpdate): Promise<T> {
      const module = moduleGetter();
      const result = module[`update${moduleName}`] ? module[`update${moduleName}`](id, data) : module.update(id, data);
      if (!result) {
        throw new Error(`${moduleName} não encontrado`);
      }
      return result;
    },

    async delete(id: string): Promise<void> {
      const module = moduleGetter();
      return module[`delete${moduleName}`] ? module[`delete${moduleName}`](id) : module.delete(id);
    },

    async search(query: string): Promise<T[]> {
      const module = moduleGetter();
      return module[`search${moduleName}s`] ? module[`search${moduleName}s`](query) : module.search(query);
    }
  };
}