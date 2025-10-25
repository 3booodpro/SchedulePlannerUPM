import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait, Select

USERNAME = 'xxxxxxxx'
PASSWORD = 'xxxxxxxx'

def IsPageReady(driver : webdriver.Chrome):
    is_page_ready = False
    while is_page_ready != True:
        is_page_ready = (driver.execute_script('return document.readyState') == 'complete' and driver.execute_script('return typeof ptgpPage!== undefined;') == True)
    time.sleep(2.0)
    return is_page_ready

def SwitchToIFrame(driver : webdriver.Chrome):
    # Wait until the iframe is present
    iframe = WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.TAG_NAME, "iframe"))
    )

    # Switch to the iframe
    driver.switch_to.frame(iframe)

    # Wait for a known element inside the iframe (e.g., <body>)
    WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.TAG_NAME, "body"))
    )
    
    IsPageReady(driver)
    pass

def SwitchToDefaultContent(driver : webdriver.Chrome):
    # When done, switch back to main content
    driver.switch_to.default_content()
    pass

def IfWarningPressOk(driver : webdriver.Chrome):
    warning_span = WebDriverWait(driver, 15).until(
        EC.presence_of_element_located((By.XPATH, '//span[contains(text(), "Student SS Warning")]'))
    )

    if warning_span:
        print("Warning popped up")

        SwitchToIFrame(driver)

        driver.implicitly_wait(30)
        ok_button = driver.find_element(By.XPATH, '//input[@type="button" and @value="OK" and @onclick]')
        ok_button.click()

        SwitchToDefaultContent(driver)
    pass

options = webdriver.ChromeOptions()
# options.add_argument('--headless=new') # Use '--headless' for older versions
options.add_experimental_option("detach", True)

# Start a browser session (e.g., Chrome)
driver = webdriver.Chrome(options=options)

# Navigate to login page or initial site
driver.get('https://sis.upm.edu.sa/psp/ps/?cmd=login')

# Wait for elements to load if needed (optional)
driver.implicitly_wait(30)

# Example: Locate button by ID, name, or other selector, then click
input_field = driver.find_element(By.ID, 'userid')  # Replace with actual input_field identifier
input_field.click()
input_field.send_keys(USERNAME)

input_field = driver.find_element(By.ID, 'pwd')  # Replace with actual input_field identifier
input_field.click()
input_field.send_keys(PASSWORD)

input_field.send_keys(Keys.RETURN)

# # After clicking, can navigate or fetch new page content as needed
# new_page_source = driver.page_source
# print(new_page_source)

# WebDriverWait(driver, 20).until(
#     lambda d: d.execute_script('return typeof ptgpPage !== "undefined";')
# )

IsPageReady(driver)

driver.implicitly_wait(30)
self_service_div = driver.find_element(By.XPATH, '//div[@onclick and .//span[contains(text(), "Self Service")]]')
self_service_div.click()

IsPageReady(driver)

SwitchToIFrame(driver)

SwitchToDefaultContent(driver)

driver.implicitly_wait(30)
class_search_tab = driver.find_element(By.XPATH, '//div[@onclick and @ptgpid="HCCC_SS_CATALOG"]')
class_search_tab.click()

IsPageReady(driver)

driver.implicitly_wait(30)
class_search_subtab = driver.find_element(By.XPATH, '//div[@onclick and @ptgpid="HC_CLASS_SEARCH"]')
class_search_subtab.click()

IsPageReady(driver)

SwitchToIFrame(driver)

driver.implicitly_wait(30)
all_classes_check = driver.find_element(By.XPATH, '//label[contains(., "Show Open Classes Only")]/..//input[@type="checkbox"]')
all_classes_check.click()

driver.implicitly_wait(30)
select_subject = driver.find_element(By.XPATH, '//*[@id="SSR_CLSRCH_WRK_SUBJECT_SRCH$0"]')
select = Select(select_subject)
select.select_by_value("CS")

driver.implicitly_wait(30)
search_button = driver.find_element(By.XPATH, '//input[@type="button" and @value="Search"]')
search_button.click()

IsPageReady(driver)

SwitchToDefaultContent(driver)

IfWarningPressOk(driver)

time.sleep(1)
print(driver.page_source)

# driver.implicitly_wait(30)

###
###  HERE IT SHOULD READ THE TABLE, BUT I DIDN'T DO IT STILL, FOR SOME REASON
###  SELENIUM COUDLN'T SEE THE TABLE, IT IS GENERATED AND NOT HARD TYPED.
###

time.sleep(10)

# Clean up
# driver.quit()