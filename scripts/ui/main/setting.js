const info = JSON.parse($file.read("config.json"))['info']

class SettingUI {
    constructor(kernel) {
        this.kernel = kernel
    }

    update_setting(key, value) {
        return this.kernel.setting.save(key, value)
    }

    create_line_label(title) {
        return {
            type: "label",
            props: {
                text: title,
                textColor: $color({
                    light: "primaryText",
                    dark: "#545454"
                }),
                align: $align.left
            },
            layout: (make, view) => {
                make.height.equalTo(50)
                make.left.inset(15)
                make.right.inset(100)
            }
        }
    }

    create_info(title, value) {
        let is_array = Array.isArray(value)
        let text = is_array ? value[0] : value
        let more_info = is_array ? value[1] : value
        return {
            type: "view",
            views: [
                this.create_line_label(title),
                {
                    type: "label",
                    props: {
                        text: text,
                        align: $align.right,
                        textColor: $color("darkGray")
                    },
                    events: {
                        tapped: function () {
                            $ui.alert({
                                title: title,
                                message: more_info,
                                actions: [
                                    {
                                        title: $l10n("COPY"),
                                        handler: () => {
                                            $clipboard.text = more_info
                                            $ui.toast($l10n("COPY_SUCCESS"))
                                        }
                                    },
                                    { title: $l10n("OK") }
                                ]
                            })
                        }
                    },
                    layout: (make, view) => {
                        make.centerY.equalTo(view.prev)
                        make.right.inset(15)
                        make.width.equalTo(200)
                    }
                }
            ],
            layout: $layout.fill,
        }
    }

    create_switch(id, title, on = true) {
        return {
            type: "view",
            views: [
                this.create_line_label(title),
                {
                    type: "switch",
                    props: {
                        on: on
                    },
                    events: {
                        changed: sender => {
                            if (!this.update_setting(id, sender.on)) {
                                sender.on = !sender.on
                            }
                        }
                    },
                    layout: (make, view) => {
                        make.centerY.equalTo(view.prev)
                        make.right.inset(15)
                    }
                }
            ],
            layout: $layout.fill,
        }
    }

    create_string(id, title, text = "") {
        return {
            type: "view",
            views: [
                this.create_line_label(title),
                {
                    type: "button",
                    props: {
                        image: $image("assets/icon/edit.png", "assets/icon/edit-dark.png"),
                        bgcolor: $color("clear"),
                        titleColor: $color({
                            light: "#ADADAD",
                            dark: "#C0C0C0"
                        })
                    },
                    events: {
                        tapped: sender => {
                            const popover = $ui.popover({
                                sourceView: sender,
                                sourceRect: sender.bounds,
                                directions: $popoverDirection.down,
                                size: $size(320, 150),
                                props: {
                                    bgcolor: $color({
                                        light: "#545454",
                                        dark: "#C0C0C0"
                                    })
                                },
                                views: [
                                    {
                                        type: "text",
                                        props: {
                                            id: id,
                                            align: $align.left,
                                            text: text
                                        },
                                        layout: (make, view) => {
                                            make.left.right.inset(10)
                                            make.top.inset(20)
                                            make.height.equalTo(90)
                                        }
                                    },
                                    {
                                        type: "button",
                                        props: {
                                            image: $image("assets/icon/check.png", "assets/icon/check-dark.png"),
                                            bgcolor: $color("clear"),
                                            titleEdgeInsets: 10,
                                            contentEdgeInsets: 0,
                                        },
                                        layout: (make, view) => {
                                            make.right.inset(10)
                                            make.bottom.inset(25)
                                            make.height.width.equalTo(30)
                                        },
                                        events: {
                                            tapped: () => {
                                                if (this.update_setting(id, $(id).text)) {
                                                    popover.dismiss()
                                                }
                                            }
                                        }
                                    }
                                ]
                            })
                        }
                    },
                    layout: (make, view) => {
                        make.centerY.equalTo(view.prev)
                        make.right.inset(15)
                        make.height.width.equalTo(25)
                    }
                }
            ],
            layout: $layout.fill,
        }
    }

    create_stepper(id, title, value = 1, min = 1, max = 12) {
        return {
            type: "view",
            views: [
                this.create_line_label(title),
                {
                    type: "label",
                    props: {
                        id: id,
                        text: value,
                        textColor: $color({
                            light: "primaryText",
                            dark: "#545454"
                        }),
                        align: $align.left
                    },
                    layout: (make, view) => {
                        make.height.equalTo(50)
                        make.right.inset(120)
                    }
                },
                {
                    type: "stepper",
                    props: {
                        min: min,
                        max: max,
                        value: value
                    },
                    events: {
                        changed: (sender) => {
                            $(id).text = sender.value
                            if (!this.update_setting(id, sender.value)) {
                                $(id).text = this.kernel.setting.get(id)
                            }
                        }
                    },
                    layout: (make, view) => {
                        make.centerY.equalTo(view.prev)
                        make.right.inset(15)
                    }
                }
            ],
            layout: $layout.fill,
        }
    }

    get_views() {
        return [
            {
                type: "list",
                props: {
                    id: "password_list",
                    style: 1,
                    reorder: false,
                    rowHeight: 50,
                    header: {
                        type: "view",
                        views: [{
                            type: "label",
                            props: {
                                text: $l10n("SETTING"),
                                align: $align.left,
                                font: $font("bold", 34),
                                line: 1
                            },
                            layout: (make, view) => {
                                make.left.right.inset(10)
                                make.height.equalTo(40)
                                make.top.inset(30)
                            }
                        }]
                    },
                    footer: {
                        type: "view",
                        views: [{
                            type: "label",
                            props: {
                                font: $font(14),
                                text: $l10n("VERSION") + " " + info.version + " © " + info.author,
                                textColor: $color({
                                    light: "#C0C0C0",
                                    dark: "#545454"
                                }),
                                align: $align.center
                            },
                            layout: (make, view) => {
                                make.left.right.inset(0)
                                make.bottom.inset(10)
                            }
                        }]
                    },
                    data: this.get_sections(),
                },
                events: {
                    swipeEnabled: () => {
                        return false
                    },
                },
                layout: make => {
                    make.left.right.top.inset(0)
                    make.bottom.inset(50)
                }
            }
        ]
    }

    get_sections() {
        let sections = []
        for (let section of this.kernel.setting.struct) {
            let rows = []
            for (let item of section.items) {
                let value = this.kernel.setting.get(item.key)
                let row = null
                switch (item.type) {
                    case "switch":
                        row = this.create_switch(item.key, $l10n(item.title), value)
                        break
                    case "stepper":
                        row = this.create_stepper(item.key, $l10n(item.title), value, 1, 12)
                        break
                    case "string":
                        row = this.create_string(item.key, $l10n(item.title), value)
                        break
                    case "info":
                        row = this.create_info($l10n(item.title), value)
                        break
                }
                rows.push(row)
            }
            sections.push({
                title: $l10n(section.title),
                rows: rows
            })
        }
        return sections
    }

    get_events() {
        return {}
    }
}

module.exports = {
    SettingUI: SettingUI
}