export interface IComperator {
  compare(...values: any[]): boolean;
}

export enum MultiComperatorType {
  And,
  Or
}

export class MultiComperator implements IComperator {
  type: MultiComperatorType;
  comperators: IComperator[];

  constructor(type: MultiComperatorType, ...comperators: IComperator[]) {
    this.type = type;
    this.comperators = comperators;
  }

  compare(...values: any[]): boolean {
    switch (this.type) {
      case MultiComperatorType.And:
        for (let i = 0; i < this.comperators.length; i++) {
          if (!!!this.comperators[i].compare(...values)) {
            return false;
          }
        }
        return true;

      case MultiComperatorType.Or:
        for (let i = 0; i < this.comperators.length; i++) {
          if (!!this.comperators[i].compare(...values)) {
            return true;
          }
        }
      return false;

      default:
        throw new Error('invalid MultiComperatorType');
    }
  }
}

export class TypeComperator implements IComperator {
  compare(...values: any[]): boolean {
    let type = typeof values[0];

    for (let i = 1; i < values.length; i++) {
      if (typeof values[i] != type) {
        return false;
      }
    }

    return true;
  }
}

export class EqualityComperator implements IComperator {
  compare(...values: any[]): boolean {
    let a = values[0];

    for (let i = 1; i < values.length; i++) {
      if (a != values[i]) {
        return false;
      }
    }

    return true;
  }
}

export class IdentityComperator implements IComperator {
  compare(...values: any[]): boolean {
    let a = values[0];

    for (let i = 1; i < values.length; i++) {
      if (a !== values[i]) {
        return false;
      }
    }

    return true;
  }
}

export class LessComperator implements IComperator {
  compare(...values: any[]): boolean {
    let a = values[0];

    for (let i = 1; i < values.length; i++) {
      if (a >= values[i]) {
        return false;
      }
    }

    return true;
  }
}

export class LessOrEqualComperator implements IComperator {
  compare(...values: any[]): boolean {
    let a = values[0];

    for (let i = 1; i < values.length; i++) {
      if (a > values[i]) {
        return false;
      }
    }

    return true;
  }
}

export class GreaterComperator implements IComperator {
  compare(...values: any[]): boolean {
    let a = values[0];

    for (let i = 1; i < values.length; i++) {
      if (a <= values[i]) {
        return false;
      }
    }

    return true;
  }
}

export class GreaterOrEqualComperator implements IComperator {
  compare(...values: any[]): boolean {
    let a = values[0];

    for (let i = 1; i < values.length; i++) {
      if (a < values[i]) {
        return false;
      }
    }

    return true;
  }
}

export class AndComperator implements IComperator {
  compare(...values: any[]): boolean {
    for (let i = 0; i < values.length; i++) {
      if (!values[i]) {
        return false;
      }
    }

    return true;
  }
}

export class OrComperator implements IComperator {
  compare(...values: any[]): boolean {
    for (let i = 0; i < values.length; i++) {
      if (!!values[i]) {
        return true;
      }
    }

    return false;
  }
}
