export const BaseAPIUrl = 'https://localhost:44394/api';
export const environment = {
    production: false,
    Product: {
        GetAllProducURL: ` ${BaseAPIUrl}/Product/GetAllAsync`,
        GetPaginatedProducURL: ` ${BaseAPIUrl}/Product/GetProductPaginatedAsync`,
        GetProductByIdAsyncURL: ` ${BaseAPIUrl}/Product/GetProductByIdAsync`,
        AddProductAsyncURL: ` ${BaseAPIUrl}/Product/AddProductAsync`,
        UpdateProductAsyncURL: ` ${BaseAPIUrl}/Product/UpdateProductAsync`,
        DeleteProductAsyncURL: ` ${BaseAPIUrl}/Product/DeleteProductAsync`,

    },
    Account: {
        RegisterURL: ` ${BaseAPIUrl}/Account/Register`,
        TokenURL: ` ${BaseAPIUrl}/Account/Token`,
        GetGetProfileURL: ` ${BaseAPIUrl}/Account/GetProfile`,

    },


};
