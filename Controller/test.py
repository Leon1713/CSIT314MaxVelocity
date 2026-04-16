from passlib.context import CryptContext
pw_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def test_password_hashing():
    password = "Admin@1234"
    hashed = pw_context.hash(password)
    print(f"Hashed password: {hashed}")
    assert pw_context.verify(password, hashed) == True
    assert pw_context.verify("wrong_password", hashed) == False
if __name__ == "__main__":
    test_password_hashing()