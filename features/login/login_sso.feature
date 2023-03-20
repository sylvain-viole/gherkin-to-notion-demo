#env
@env_prod

#browser
@browser_chrome @browser_edge @browser_webkit

#squad
@squad_connect


Feature: User SSO log i

Scenario: Visitor SSO logs in with valid credentials
    Given a visitor on the login page
    When the visitor logs in with valid SSO
    Then the visitor is logged in

Scenario: Visitor SSO logs in with bad credentials
    Given a visitor on the login page
    When the visitor logs in with bad SSO
    Then the visitor is not logged in