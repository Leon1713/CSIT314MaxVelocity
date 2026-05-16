from Entity.Account import Account
class SearchUserAccountsController :
    def search(input):
        try:
            return Account.search(input)
        except Exception as e:
            print(e)
            raise