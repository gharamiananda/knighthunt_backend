import { FilterQuery, Query } from 'mongoose';

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(searchableFields: string[]) {
    const searchTerm = this?.query?.searchTerm;
    if (searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map(
          (field) =>
            ({
              [field]: { $regex: searchTerm, $options: 'i' },
            }) as FilterQuery<T>,
        ),
      });
    }

    return this;
  }

  filter() {
    const queryObj = { ...this.query }; // copy
    // Filtering
    const excludeFields = ['searchTerm', 'sortBy', 'limit', 'page', 'fields','minPrice','maxPrice','tags','level','startDate','endDate'];

    excludeFields.forEach((el) => delete queryObj[el]);
    
    if (this.query.minPrice !== undefined && this.query.maxPrice === undefined) {
        queryObj.price = { $gte: Number( this.query.minPrice) };
    }
    
    if (this.query.maxPrice !== undefined) {
        
        queryObj.price = {$gte: Number( this.query.minPrice ||0) , $lte: Number(this.query.maxPrice) };
        
    }

    const tags: Record<string, unknown> = { isDeleted: false };
    
    if (this.query.tags) {
        tags.name = this.query.tags;
        queryObj.tags =  { $elemMatch: tags } 
        
    }
    
  


  if (this.query.level) {
    queryObj['details.level']=this.query.level    
}


if (this.query.startDate !== undefined) {
    queryObj.startDate = { $gte: this.query.startDate as string } as FilterQuery<T>['startDate'];
  }

  if (this.query.endDate !== undefined) {
    if (!queryObj.startDate) {
      queryObj.startDate = {} as FilterQuery<T>['startDate'];
    }
    (queryObj.startDate as FilterQuery<T>['startDate']).$lte = this.query.endDate
  }



    
    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);
    return this;
  }

  sort() {
    const sort =
      (this?.query?.sortBy as string)?.split(',')?.join(' ') || '-createdAt';
    this.modelQuery = this.modelQuery.sort(sort as string);

    return this;
  }

  paginate() {
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }

  fields() {
    const fields =
      (this?.query?.fields as string)?.split(',')?.join(' ') || '-__v';

    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }
  async countTotal() {
    const totalQueries = this.modelQuery.getFilter();
    const total = await this.modelQuery.model.countDocuments(totalQueries);
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const totalPage = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPage,
    };
  }
}

export default QueryBuilder;