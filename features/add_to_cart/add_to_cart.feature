#env
@env_staging @env_prod

#browser
@browser_chrome @browser_edge @browser_webkit

#squad
@squad_shop


Feature: User adds an item to cart

Scenario: User adds an item from product list
    Given a user on the product list page
    When the user adds a product to cart
    Then the product is added to cart

Scenario: User adds an item from product page
    Given a user on the product detail page
    When the user adds a product to cart
    Then the product is added to cart