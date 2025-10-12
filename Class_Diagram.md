# 1. Class Diagram - Food App

```mermaid
classDiagram
    %% Backend Models (MongoDB/Mongoose)
    class User {
        +String name
        +String email
        +String passwordHash
        +String role
        +Boolean isActive
        +String avatarUrl
        +String oauthProvider
        +String oauthId
        +Date createdAt
        +Date updatedAt
        +comparePassword(password) Boolean
    }

    class Product {
        +String name
        +String description
        +Number price
        +String[] images
        +String[] tags
        +ObjectId createdBy
        +Date createdAt
        +Date updatedAt
    }

    class Order {
        +ObjectId user
        +OrderItem[] items
        +Number totalAmount
        +String status
        +DeliveryAddress deliveryAddress
        +String paymentMethod
        +String notes
        +Date createdAt
        +Date updatedAt
        +calculateTotal() Number
    }

    class OrderItem {
        +ObjectId product
        +Number quantity
        +Number price
    }

    class DeliveryAddress {
        +String street
        +String city
        +String postalCode
        +String phone
    }

    %% Frontend Types & Contexts
    class CartContext {
        +CartItem[] items
        +Number totalItems
        +Number totalAmount
        +addItem(item) void
        +removeItem(productId) void
        +updateQuantity(productId, quantity) void
        +clearCart() void
    }

    class CartItem {
        +Product product
        +Number quantity
    }

    class AdminOrder {
        +ObjectId user
        +OrderItem[] items
        +Number totalAmount
        +String status
        +DeliveryAddress deliveryAddress
        +String paymentMethod
        +String notes
        +Date createdAt
        +Date updatedAt
        +User userInfo
    }

    %% Backend Controllers
    class AuthController {
        +register(req, res, next) void
        +login(req, res, next) void
        +me(req, res, next) void
        +oauthSuccess(req, res) void
        +signToken(user) String
    }

    class ProductController {
        +createProduct(req, res, next) void
        +getProducts(req, res, next) void
        +getProductById(req, res, next) void
        +updateProduct(req, res, next) void
        +deleteProduct(req, res, next) void
    }

    class OrderController {
        +createOrder(req, res, next) void
        +getUserOrders(req, res, next) void
        +getOrderById(req, res, next) void
        +updateOrderStatus(req, res, next) void
        +cancelOrder(req, res, next) void
        +getAllOrders(req, res, next) void
    }

    class UserController {
        +getUsers(req, res, next) void
        +updateUser(req, res, next) void
        +deleteUser(req, res, next) void
    }

    %% Services
    class RealtimeService {
        +initializeRealtime(server) void
        +emitToUser(userId, event, data) void
    }

    class FileService {
        +uploadFile(req, res, next) void
        +getFile(req, res, next) void
    }

    %% Frontend Hooks & Contexts
    class useAuth {
        +token String
        +user Object
        +isLoading Boolean
        +setToken(token) void
        +setUser(user) void
        +refreshUser() void
        +updateToken(token) void
    }

    class useSocket {
        +socket Socket
        +connect() void
        +disconnect() void
    }

    %% Relationships
    User ||--o{ Order : "places"
    User ||--o{ Product : "creates"
    Order ||--o{ OrderItem : "contains"
    OrderItem }o--|| Product : "references"
    Order ||--|| DeliveryAddress : "has"
    CartContext ||--o{ CartItem : "manages"
    CartItem }o--|| Product : "references"
    AdminOrder --|> Order : "extends"
    
    %% Controller relationships
    AuthController --> User : "manages"
    ProductController --> Product : "manages"
    OrderController --> Order : "manages"
    OrderController --> RealtimeService : "uses"
    UserController --> User : "manages"
    FileService --> Product : "handles uploads"
    
    %% Frontend relationships
    useAuth --> User : "manages state"
    useSocket --> RealtimeService : "connects to"
    CartContext --> CartItem : "manages"
```
