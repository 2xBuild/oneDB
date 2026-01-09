// here we handle dynamic routes for all catagories of data.

export default async function Page({ params }: { params: Promise<{ categories: string[] }> }) {
    const categories: { categories: string[] } = await params;


    if(categories.categories[0] === 'people') {
        return <div>
            <h1>People</h1>
        </div>
    }

    if(categories.categories![0] === 'products') {
        return <div>
            <h1>Products</h1>
        </div>
    }

    if(categories.categories![0] === 'orders') {
        return <div>
            <h1>Orders</h1>
        </div>
    }
    else{
        return <div>
            <h1>Not Found</h1>
        </div>
    }
}

// or just query the db with ctagory and filter name. return the result. 