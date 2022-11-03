//external modules
import inquirer from 'inquirer'
import chalk from 'chalk'

//core modules
import fs from 'fs'

operation()

function operation() {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Selecione uma operação',
        choices: [
          'Criar conta',
          'Consultar Saldo',
          'Depositar',
          'Sacar',
          'Transferir',
          'Sair'
        ],
      },
    ])
    .then((res) => {
      const action = res.action

      if (action === 'Criar conta') {
        createAccount()
      } else if (action === 'Depositar') {
        deposit()
      } else if (action === 'Consultar Saldo') {
        getAccountBalance()
      } else if (action === 'Sacar') {
        withdraw()
      } else if (action === 'Transferir') {
        transfer()
      } else if (action === 'Sair') {
        console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'))
        process.exit()
      }
    })
}

// create user account
function createAccount() {
  console.log(chalk.bgGreen.black('Parabéns por escolher nosso serviço!'))
  console.log(chalk.green('A seguir, defina as opções da sua conta'))

  buildAccount()
}

function buildAccount() {
  inquirer
    .prompt([
      {
        name: 'accountName',
        message: 'Digite um nome para a sua conta:',
      },
    ])
    .then((res) => {
      console.info(res.accountName)

      const accountName = res.accountName

      if (!fs.existsSync('accounts')) {
        fs.mkdirSync('accounts')
      }

      if (fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(
          chalk.bgRed.black('Esta conta já existe, escolha outro nome!'),
        )
        buildAccount(accountName)
      }

      fs.writeFileSync(
        `accounts/${accountName}.json`,
        '{"balance":0}',
        function (err) {
          console.log(err)
        },
      )

      console.log(chalk.green('Parabéns, sua conta foi criada!'))
      operation()
    })
}

// add an amount to user account
function deposit() {
  inquirer
    .prompt([
      {
        name: 'accountName',
        message: 'Qual o nome da sua conta?',
      },
    ])
    .then((res) => {
      const accountName = res.accountName

      if (!checkAccount(accountName)) {
        return deposit()
      }

      inquirer
        .prompt([
          {
            name: 'amount',
            message: 'Quanto você deseja depositar?',
          },
        ])
        .then((res) => {
          const amount = res['amount']

          addAmount(accountName, amount)
          operation()
        })
    })
}

function checkAccount(accountName) {
  if (!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log(chalk.bgRed.black('Esta conta não existe, escolha outro nome!'))
    return false
  }
  return true
}

function getAccount(accountName) {
  const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: 'utf8',
    flag: 'r',
  })

  return JSON.parse(accountJSON)
}

function addAmount(accountName, amount) {
  const accountData = getAccount(accountName)

  if (!amount) {
    console.log(
      chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'),
    )
    return deposit()
  }

  accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (err) {
      console.log(err)
    },
  )

  console.log(
    chalk.green(`Foi depositado o valor de R$${amount} na conta: ${accountName}`)
  )
}

// return account balance
function getAccountBalance() {
  inquirer
    .prompt([
      {
        name: 'accountName',
        message: 'Qual o nome da sua conta?',
      },
    ])
    .then((answer) => {
      const accountName = answer['accountName']

      if (!checkAccount(accountName)) {
        return getAccountBalance()
      }

      const accountData = getAccount(accountName)

      console.log(
        chalk.bgBlue.black(
          `Olá, o saldo na conta ${accountName} é de R$${accountData.balance}`
        )
      )
      operation()
    })
}

// get money from account
function withdraw() {
  inquirer
    .prompt([
      {
        name: 'accountName',
        message: 'Qual o nome da sua conta?',
      },
    ])
    .then((answer) => {
      const accountName = answer['accountName']

      if (!checkAccount(accountName)) {
        return withdraw()
      }

      inquirer
        .prompt([
          {
            name: 'amount',
            message: 'Quanto você deseja sacar?',
          },
        ])
        .then((answer) => {
          const amount = answer['amount']

          removeAmount(accountName, amount)
          operation()
        })
    })
}

function removeAmount(accountName, amount) {
  const accountData = getAccount(accountName)

  if (!amount) {
    console.log(
      chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'),
    )
    return withdraw()
  }

  if (accountData.balance < amount) {
    console.log(chalk.bgRed.black('Valor indisponível!'))
    return withdraw()
  }

  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (err) {
      console.log(err)
    },
  )

  console.log(
    chalk.green(`Foi realizado um saque de R$${amount} da conta: ${accountName}`)
  )
}

function transfer() {

  inquirer.prompt([
    {
      name: 'sourceAccount',
      message: 'Qual a sua conta?'
    },
    {
      name: 'destinationAccount',
      message: 'Para qual conta gostaria de transferir?'
    }
  ])
  .then((res) => {
    const sourceAccount = res.sourceAccount
    const destinationAccount = res.destinationAccount

    if (!checkAccount(sourceAccount) || !checkAccount(destinationAccount)) {
      return transfer()
    }else if(sourceAccount === destinationAccount){
      console.log(chalk.bgRed.black('Contas iguais! Escolha uma conta diferente!'))
      return transfer()
    }

    inquirer
      .prompt([
        {
          name: 'amount',
          message: 'Qual o valor da transferência?',
        },
      ])
      .then((res) => {
        const amount = res['amount']
        const accountData = getAccount(sourceAccount)

        if (!amount) {
          console.log(
            chalk.bgRed.black('Valor inválido!'),
          )
          return transfer()
        }
      
        if (accountData.balance < amount) {
          console.log(chalk.bgRed.black('Saldo indisponível!'))
          return transfer()
        }
      

        addAmount(destinationAccount, amount)
        removeAmount(sourceAccount, amount)

        operation()
      })
  })
  
}


