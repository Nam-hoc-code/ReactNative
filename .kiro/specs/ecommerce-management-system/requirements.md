# Requirements Document

## Introduction

This document specifies the requirements for an E-commerce Management System built as a React Native (Expo) application. The system extends the existing SQLite practice code with basic authentication (Login, Register) to provide comprehensive product management, user management, and shopping functionalities for both administrators and regular users.

The system supports two primary user roles:
- **Administrator**: Full access to manage product categories, products, users, and orders
- **Regular User**: Access to browse products, manage shopping cart, place orders, and view order history

## Glossary

- **System**: The E-commerce Management System React Native application
- **Admin**: A user with administrative privileges who can manage categories, products, users, and orders
- **User**: A regular authenticated user who can browse and purchase products
- **Product_Category**: A classification group for products (e.g., Electronics, Phones, Laptops)
- **Product**: An item available for purchase with name, price, image, and category
- **Shopping_Cart**: A temporary collection of products selected by a user before checkout
- **Order**: A confirmed purchase transaction containing products, user information, and status
- **Order_Status**: The current state of an order (e.g., Pending, Processing, Completed, Cancelled)
- **Database**: The SQLite database storing all application data
- **Authentication_Service**: The component responsible for user login and registration
- **Cart_Manager**: The component managing shopping cart operations
- **Search_Engine**: The component handling product search and filtering

## Requirements

### Requirement 1: User Authentication

**User Story:** As a user, I want to register and log in to the system, so that I can access personalized features and maintain my shopping history.

#### Acceptance Criteria

1. THE Authentication_Service SHALL support user registration with username between 3 and 30 characters, password between 8 and 128 characters, email not exceeding 254 characters, and full name between 1 and 100 characters
2. IF a user attempts to register with a username already in the Database, THEN THE System SHALL reject the registration and display an error message indicating the username is already taken
3. IF a user attempts to register with an email already in the Database, THEN THE System SHALL reject the registration and display an error message indicating the email is already in use
4. WHEN a user successfully registers, THE System SHALL store the user credentials in the Database and display a confirmation message
5. THE Authentication_Service SHALL support user login with username and password
6. WHEN a user submits credentials where the username exists in the Database AND the password matches the stored password, THE System SHALL authenticate the user and grant access to authenticated features
7. WHEN a user submits credentials where the username does not exist in the Database OR the password does not match the stored password, THE System SHALL display an error message within 500ms
8. WHEN a user session is created, THE System SHALL maintain the session for 24 hours or until the user logs out, whichever occurs first
9. IF a user session expires after 24 hours, THEN THE System SHALL require the user to log in again to access authenticated features
10. WHEN a user logs out, THE System SHALL clear the user session and return to the login screen

### Requirement 2: Product Category Management (Admin)

**User Story:** As an admin, I want to manage product categories, so that I can organize products effectively.

#### Acceptance Criteria

1. THE System SHALL display a list of all product categories to authenticated admins
2. WHEN an admin adds a new category with a name between 1 and 100 characters that does not already exist in the Database, THE System SHALL create the category in the Database
3. IF an admin attempts to add a category with an empty name or a name containing only whitespace, THEN THE System SHALL reject the request and display an error message indicating the category name is required
4. WHEN an admin attempts to add a duplicate category name, THE System SHALL reject the request and display an error message indicating the category name already exists
5. WHEN an admin edits a category with a new name between 1 and 100 characters that does not conflict with existing category names, THE System SHALL update the category name in the Database
6. IF an admin attempts to edit a category to a name that already exists, THEN THE System SHALL reject the request and display an error message indicating the category name already exists
7. IF an admin attempts to edit or delete a category that does not exist, THEN THE System SHALL display an error message indicating the category was not found
8. WHEN an admin deletes a category that has no associated products, THE System SHALL remove the category from the Database
9. IF an admin attempts to delete a category that has associated products, THEN THE System SHALL reject the deletion and display an error message indicating the category cannot be deleted because it contains products
10. WHEN an admin selects a category, THE System SHALL display all products associated with that category

### Requirement 3: Product Management (Admin)

**User Story:** As an admin, I want to manage products, so that I can maintain an up-to-date product catalog.

#### Acceptance Criteria

1. THE System SHALL display a list of all products with their name, price, image, description, and category to authenticated admins
2. WHEN an admin adds a new product with all required fields (name, price, category) and optional fields (image URL, description), THE System SHALL create the product in the Database
3. IF an admin attempts to add a product with a name exceeding 200 characters, THEN THE System SHALL reject the request and display an error message indicating name length limit
4. IF an admin attempts to add a product with an image URL exceeding 500 characters, THEN THE System SHALL reject the request and display an error message indicating URL length limit
5. WHEN an admin adds a product, THE System SHALL validate that the price is between 0.01 and 999999999.99
6. IF an admin attempts to add a product with a price outside the valid range, THEN THE System SHALL reject the request and display an error message indicating invalid price
7. WHEN an admin edits a product, THE System SHALL allow modification of name, price, image URL, description, and category
8. WHEN an admin successfully edits a product, THE System SHALL update the product information in the Database
9. WHEN an admin deletes a product that is not referenced in any existing orders, THE System SHALL remove the product from the Database
10. IF an admin attempts to delete a product that is referenced in existing orders, THEN THE System SHALL reject the deletion and display an error message indicating the product cannot be deleted
11. THE System SHALL associate each product with exactly one Product_Category
12. IF an admin attempts to add or edit a product with a non-existent category, THEN THE System SHALL reject the request and display an error message indicating invalid category

### Requirement 4: User Management (Admin)

**User Story:** As an admin, I want to manage users, so that I can control access and assign appropriate roles.

#### Acceptance Criteria

1. THE System SHALL display a list of all registered users to authenticated admins within 2 seconds
2. WHEN an admin views a user, THE System SHALL display the username, email, full name, and current role
3. WHEN an admin updates a user role to a valid value (Admin or User), THE System SHALL persist the role change in the Database within 1 second
4. IF an admin attempts to update a user role to an invalid value, THEN THE System SHALL display an error message indicating invalid role and reject the update
5. WHEN an admin initiates deletion of a user account, THE System SHALL require confirmation before proceeding
6. WHEN an admin confirms deletion of a user account that is not the currently logged-in admin, THE System SHALL remove the user account and preserve associated order history in the Database
7. IF an admin attempts to delete the currently logged-in admin account, THEN THE System SHALL display an error message indicating self-deletion is not allowed and prevent the deletion
8. WHEN a user account is successfully deleted, THE System SHALL display a confirmation message

### Requirement 5: Product Search and Filtering

**User Story:** As a user, I want to search and filter products, so that I can quickly find items I'm interested in.

#### Acceptance Criteria

1. WHEN a user enters a search query of 1 to 200 characters, THE Search_Engine SHALL return all products where the query appears as a substring in the product name or category name, limited to 1000 results, within 1 second
2. THE Search_Engine SHALL perform case-insensitive search on product names and category names
3. WHEN a user specifies a price range with minimum and maximum values between 0.00 and 999999.99, THE System SHALL display only products whose price is greater than or equal to the minimum value and less than or equal to the maximum value
4. IF a user specifies a minimum price greater than the maximum price, THEN THE System SHALL display an error message indicating invalid price range and retain the previous filter state
5. WHEN a user applies multiple filters simultaneously from search query and price range, THE System SHALL apply all filters using AND logic
6. WHEN no products match the search criteria, THE System SHALL display a message indicating zero results found
7. WHEN a user enters an empty or whitespace-only search query, THE System SHALL return all products without applying search filtering
8. IF a user enters a search query exceeding 200 characters, THEN THE System SHALL display an error message indicating query length exceeded and reject the search
9. IF a user enters a price value less than 0.00 or greater than 999999.99, THEN THE System SHALL display an error message indicating invalid price value and reject the filter

### Requirement 6: Shopping Cart Management

**User Story:** As a user, I want to manage my shopping cart, so that I can review and modify items before purchasing.

#### Acceptance Criteria

1. WHEN a user adds a product with a quantity between 1 and 9999 to the cart, THE Cart_Manager SHALL store the product and quantity in the shopping cart
2. IF a user attempts to add a product with a quantity less than 1 or greater than 9999, THEN THE System SHALL reject the addition and display an error message indicating invalid quantity
3. THE System SHALL display the current shopping cart contents with product names, quantities, individual prices, and total price
4. WHEN a user updates the quantity of a cart item to a value between 1 and 9999, THE Cart_Manager SHALL recalculate the total price within 200ms
5. IF a user attempts to update a cart item quantity to a value less than 1 or greater than 9999, THEN THE System SHALL reject the change and display an error message indicating invalid quantity
6. WHEN a user removes an item from the cart, THE Cart_Manager SHALL update the cart and recalculate the total within 200ms
7. THE System SHALL persist the shopping cart state for the logged-in user session
8. IF a user attempts to add a product that already exists in the cart, THEN THE System SHALL increase the quantity of the existing cart item instead of creating a duplicate entry
9. WHEN the shopping cart is empty, THE System SHALL display a message indicating the cart is empty
10. IF a product in the cart is deleted from the Database by an admin, THEN THE System SHALL remove that product from all user shopping carts

### Requirement 7: Order Checkout and Placement

**User Story:** As a user, I want to checkout and place orders, so that I can complete purchases.

#### Acceptance Criteria

1. WHEN a user initiates checkout with a non-empty cart, THE System SHALL display an order summary listing each product name, quantity, individual price, and the total order cost
2. IF a user attempts to checkout with products that no longer exist in the Database, THEN THE System SHALL display an error message indicating which products are unavailable and prevent order creation
3. WHEN a user confirms the order, THE System SHALL create an Order record in the Database with order_id, user_id, order_date (current timestamp), total_amount, and status "Pending"
4. WHEN an order is successfully created, THE System SHALL clear the shopping cart within 500ms
5. THE System SHALL associate each Order with the purchasing user via user_id foreign key
6. THE System SHALL store order items with product_id, product name, quantity, and unit price at the time of purchase for each item in the order
7. WHEN a user attempts to checkout with an empty cart, THE System SHALL display an error message indicating the cart is empty and prevent order creation
8. WHEN an order is successfully placed, THE System SHALL display a confirmation message with the order identifier within 1 second
9. IF the Database fails to create the order record, THEN THE System SHALL display an error message indicating order placement failed and SHALL NOT clear the shopping cart

### Requirement 8: Order History

**User Story:** As a user, I want to view my order history, so that I can track my purchases.

#### Acceptance Criteria

1. THE System SHALL display a list of all orders placed by the authenticated user
2. WHEN a user views order history, THE System SHALL display order date in YYYY-MM-DD format, order identifier, total amount in VND currency format, and Order_Status for each order
3. WHEN a user selects an order, THE System SHALL display detailed order information including customer name, order date, order identifier, Order_Status, and for each order item: product name, quantity, unit price, and subtotal
4. THE System SHALL sort orders by date in descending order with most recent first
5. WHEN a user has no orders in the Database, THE System SHALL display a message indicating no orders found

### Requirement 9: User Profile Management

**User Story:** As a user, I want to update my profile information, so that I can keep my account details current.

#### Acceptance Criteria

1. THE System SHALL display the current user profile with username, email, and full name
2. WHEN a user updates their email, THE System SHALL validate that the email contains exactly one @ symbol with at least one character before and after it, and does not exceed 254 characters
3. IF email validation fails, THEN THE System SHALL display an error message indicating invalid email format and SHALL NOT save the change
4. WHEN a user updates their full name, THE System SHALL accept names between 1 and 100 characters
5. IF the full name is empty or exceeds 100 characters, THEN THE System SHALL display an error message indicating the character limit and SHALL NOT save the change
6. WHEN a user updates their full name with valid input, THE System SHALL persist the change in the Database
7. IF the Database save operation fails, THEN THE System SHALL display an error message indicating the update could not be saved and SHALL retain the original profile data
8. THE System SHALL prevent users from changing their username after registration
9. IF a user attempts to modify their username, THEN THE System SHALL display an error message indicating usernames cannot be changed
10. WHEN a user updates their password, THE System SHALL require the current password for verification
11. THE System SHALL require new passwords to contain at least 6 characters and no more than 128 characters
12. IF current password verification fails, THEN THE System SHALL display an error message indicating incorrect password and SHALL NOT save the new password
13. WHEN a profile update is successfully saved, THE System SHALL display a confirmation message indicating the update was successful

### Requirement 10: Order Management (Admin)

**User Story:** As an admin, I want to manage orders, so that I can process and fulfill customer purchases.

#### Acceptance Criteria

1. THE System SHALL display a list of all orders to authenticated admins
2. WHEN an admin views an order, THE System SHALL display customer username, customer email, order date, order identifier, Order_Status, and for each order item: product name, quantity, unit price, and total amount
3. WHEN an admin updates an Order_Status to a valid status value, THE System SHALL persist the status change in the Database and display a success confirmation message
4. THE System SHALL support the following order statuses: Pending, Processing, Shipped, Completed, Cancelled
5. WHEN an admin updates order status to Completed, THE System SHALL record the completion timestamp
6. WHEN an admin selects a status filter value, THE System SHALL display only orders matching that Order_Status
7. WHEN an admin enters a search query, THE System SHALL return all orders where the query matches the customer username or order identifier as a substring, case-insensitive
8. WHEN a filter or search returns no matching orders, THE System SHALL display a message indicating no orders found
9. IF an admin attempts to update an order status to an invalid value, THEN THE System SHALL display an error message indicating the status is invalid and reject the update

### Requirement 11: Data Persistence

**User Story:** As a system stakeholder, I want all data to be persisted reliably, so that information is not lost between sessions.

#### Acceptance Criteria

1. THE Database SHALL use SQLite for local data storage
2. WHEN the application starts, THE System SHALL initialize the Database schema if it does not exist within 5 seconds
3. IF the Database schema already exists when the application starts, THEN THE System SHALL proceed without re-initialization
4. THE Database SHALL maintain referential integrity between products and categories using foreign keys
5. THE Database SHALL maintain referential integrity between orders and users using foreign keys
6. IF a database operation attempts to violate referential integrity (e.g., deleting a category with products), THEN THE Database SHALL reject the operation
7. WHEN a database operation fails, THE System SHALL display an error message indicating the operation that failed within 500ms
8. THE System SHALL support both SQLite mode and mock mode for development and testing purposes
9. WHEN configured in mock mode, THE System SHALL use in-memory data structures instead of SQLite database
10. WHEN configured in SQLite mode, THE System SHALL persist all data to the device storage

### Requirement 12: Role-Based Access Control

**User Story:** As a system administrator, I want role-based access control, so that users can only access features appropriate to their role.

#### Acceptance Criteria

1. WHEN a user registers, THE System SHALL assign the User role as the default role
2. THE System SHALL assign each user either an Admin role or a User role
3. WHEN a user with User role attempts to access admin features (category management, product management, user management, order management), THE System SHALL deny access and display an error message within 200ms
4. THE System SHALL display admin-specific navigation options (Categories, Manage Products, Manage Users, Manage Orders) only to users with Admin role
5. THE System SHALL display user-specific navigation options (Products, Cart, Orders, Profile) only to authenticated users
6. WHEN a user is not authenticated, THE System SHALL display only the login screen and registration screen

### Requirement 13: Product Display and Details

**User Story:** As a user, I want to view product details, so that I can make informed purchase decisions.

#### Acceptance Criteria

1. THE System SHALL display product listings with product image, name, price, category, and description
2. WHEN a user selects a product, THE System SHALL display a detailed product view with full description and image with minimum width of 300 pixels
3. IF a product has no description, THEN THE System SHALL display a message indicating no description available
4. THE System SHALL format prices in Vietnamese Dong (VND) currency format with thousands separator (e.g., 1.000.000 VND)
5. WHEN a product image URL is empty, THE System SHALL display a placeholder image
6. IF a product image fails to load within 10 seconds, THEN THE System SHALL display a placeholder image
7. IF a product image URL returns an HTTP error status, THEN THE System SHALL display a placeholder image
8. THE System SHALL display products sorted by most recently added first by default

