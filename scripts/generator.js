<<<<<<< HEAD
class Generator {
    part = null
    length = null
    connector = null
    character_set = null

    constructor() {
        this.update()
    }

    update() {
        this.part = $prefs.get("settings.generator.part")
        this.length = $prefs.get("settings.generator.length")
        this.connector = $prefs.get("settings.generator.connector") ? "-" : ""
        this.character_set = $prefs.get("settings.generator.character_set")
    }

    _generate_part() {
        let result = ""
        for (let i = 0; i < this.length; i++) {
            result += this.character_set[Math.floor(Math.random() * this.character_set.length)]
        }
        return result
    }

    generate() {
        this.update()
        var result = [];
        for (let i = 0; i < this.part; i++) {
            result.push(this._generate_part())
        }
        return result.join(this.connector)
    }
}

module.exports = {
    Generator: Generator
=======
class Generator {
    part = null
    length = null
    connector = null
    character_set = null

    constructor() {
        this.update()
    }

    update() {
        this.part = $prefs.get("settings.generator.part")
        this.length = $prefs.get("settings.generator.length")
        this.connector = $prefs.get("settings.generator.connector") ? "-" : ""
        this.character_set = $prefs.get("settings.generator.character_set")
    }

    _generate_part() {
        let result = ""
        for (let i = 0; i < this.length; i++) {
            result += this.character_set[Math.floor(Math.random() * this.character_set.length)]
        }
        return result
    }

    generate() {
        this.update()
        var result = [];
        for (let i = 0; i < this.part; i++) {
            result.push(this._generate_part())
        }
        return result.join(this.connector)
    }
}

module.exports = {
    Generator: Generator
>>>>>>> 0a1b00b45c83e9fe790ee5c8312707e94c1028fc
}