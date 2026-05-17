from Entity.Account import Account
class SearchUserAccountsController :
    def search(self, input, is_active):
        try:
            return Account.search(input,  is_active)
        except Exception as e:
            print(e)
            raise