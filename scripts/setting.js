class Setting {
    constructor() {
        this.path = "assets/setting.json"
        this.setting = {}
        this.struct = JSON.parse($file.read("setting.json"))
        let user = {}
        if ($file.exists(this.path)) {
            user = JSON.parse($file.read(this.path))
        }
        for (let section of this.struct) {
            for (let item of section.items) {
                this.setting[item.key] = item.key in user ? user[item.key] : item.value
            }
        }
    }

    get(key) {
        return this.setting[key]
    }

    save(key, value) {
        this.setting[key] = value
        $file.write({
            data: $data({ string: JSON.stringify(this.setting) }),
            path: this.path
        })
        return true
    }
}

module.exports = {
    Setting: Setting
}