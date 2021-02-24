class Generator {
    constructor(setting) {
        this.setting = setting
        this.update()
    }

    update() {
        this.part = this.setting.get("generator.part")
        this.length = this.setting.get("generator.length")
        this.connector = this.setting.get("generator.connector") ? "-" : ""
        this.characterSet = this.setting.get("generator.characterSet")
    }

    generatePart() {
        let result = ""
        for (let i = 0; i < this.length; i++) {
            result += this.characterSet[Math.floor(Math.random() * this.characterSet.length)]
        }
        return result
    }

    generate() {
        this.update()
        const result = []
        for (let i = 0; i < this.part; i++) {
            result.push(this.generatePart())
        }
        return result.join(this.connector)
    }
}

module.exports = Generator