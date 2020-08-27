class Generator {
    constructor(setting) {
        this.setting = setting
        this.update()
    }

    update() {
        this.part = this.setting.get("generator.part")
        this.length = this.setting.get("generator.length")
        this.connector = this.setting.get("generator.connector") ? "-" : ""
        this.character_set = this.setting.get("generator.character_set")
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
        var result = []
        for (let i = 0; i < this.part; i++) {
            result.push(this._generate_part())
        }
        return result.join(this.connector)
    }
}

module.exports = Generator