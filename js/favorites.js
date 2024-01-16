import { GithubUser } from "./GithubUser.js";

// classe que vai conter a lógica dos dados
export class Favorites {
    constructor (root) {
        // aqui eu procuro o "root" que neste caso é o "#app" e atribuo ele ao this.root 
        this.root = document.querySelector(root)
        this.load ()
    }

    load () {
        this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
    }

    save () {
        localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
    }

   async add (username) {
    // tratamento de erro
    try {

        const userExists = this.entries.find(entry => entry.login === username)

        if(userExists) {
            throw new Error('Usuário já cadastrado')
        }

        const user = await GithubUser.search(username)

        if(user.login === undefined) {
            throw new Error('Usuário não encontrado!')
        }

        this.entries = [user, ...this.entries]
        this.update()
        this.save()

    } catch (error) {
        alert(error.message)
    }
    }

    delete (user) {
        // principios da imutabilidade para programar (neste caso um dos principios aplicados é ao invés de modificar diretamente um array existente, devemos criar um novo array com as alterações desejadas.)
        const filteredEntries = this.entries.filter(entry => entry.login !== user.login)

        this.entries = filteredEntries
        this.update()
        this.save()
    }
}

// calsse que vai criar a visualização e eventos no html
export class FavoritesView extends Favorites {
    constructor(root) {
        // o super serve como uma forma de juntas as 2 classes
        super(root)

        // estou pegando meu tbody
        this.tbody = this.root.querySelector('table tbody')

        this.update()
        this.onadd()
    }

    // função para buscar o usario do github
    onadd () {
        const addButton = this.root.querySelector('.github-search button')
        
        addButton.onclick = () => {
            const {value} = this.root.querySelector('.github-search input')

            this.add(value)
        }
       
    }

    // função de update
    update () {
        this.removeAllTr()

        this.entries.forEach(user => {
            const row = this.createRow()

            row.querySelector('.user img').src = `https://github.com/${user.login}.png`
            row.querySelector('.user img').alt = `imagem de ${user.name}`
            row.querySelector('.user a').href = `https://github.com/${user.login}`
            row.querySelector('.user p').textContent = user.name
            row.querySelector('.user span').textContent = user.login
            row.querySelector('.repositories').textContent = user.public_repos
            row.querySelector('.followers').textContent = user.followers

            row.querySelector('.remove').onclick = () => {
                const isOk = confirm('Tem certeza que deseja apagar este usuario ?')

                if(isOk) {
                    this.delete(user)
                }
            }

            this.tbody.append(row)
        })
    }
    
    // função para criar uma linha 
    createRow () {
        // estou criando o elemento "tr"
        const tr = document.createElement('tr')
        
        const content = `
            <td class="user">
            <img src="https://github.com/maykbrito.png" alt="imagem de maykbrito">

            <a href="https://github.com/maykbrito" target="_blank">

            <p>Mayk Brito</p>

            <span>maykbrito</span>
            </a>
            </td>
            <td class="repositories">
            50
            </td>
            <td class="followers">
            10000
            </td>
            <td><button class="remove">&times;</button></td>
        `
        // o innerHTML serve para adicionar o meu conteudo dentro do meu elemento "tr" 
        tr.innerHTML = content

        return tr
    }

    // função para remover uma linha
    removeAllTr () {
        

        // estou pegando todos os meus "tr" do tbody
        this.tbody.querySelectorAll('tr')
        // forEach ou seja (para cada um deles) execute a função no caso a função é para remover
        .forEach((tr) => {
            tr.remove()
        })
    }
}