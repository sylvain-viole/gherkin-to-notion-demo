#env
@env_staging @env_prod

#browser
@browser_chrome @browser_edge @browser_webkit

#squad
@squad_connect


Feature: User classic log i

Scenario: Visitor classic logs in with valid credentials
    Given a visitor on the login page
    When the visitor logs in with valid credential
    Then the visitor is logged in

Scenario: Visitor classic logs in with bad credentials
    Given a visitor on the login page
    When the visitor logs in with bad credential
    Then the visitor is not logged in