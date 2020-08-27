class EditorUI {
    constructor(kernel, factory) {
        this.kernel = kernel
        this.factory = factory
    }

    save(password, is_update, index) {
        if (password.password === "") {
            $ui.toast($l10n("NO_PASSWORD"))
            return false
        }
        let result
        if (is_update) {
            result = this.kernel.storage.update(password)
        } else {
            result = this.kernel.storage.save(password)
        }
        if (result) {
            $ui.success($l10n("SAVE_SUCCESS"))
            // 更新storage_list
            let storage = require("./storage")
            index = is_update ? index : null
            storage.update(password, index)
            // 弹出窗口
            setTimeout(() => {
                $ui.pop()
            }, 500)
        } else {
            $ui.error($l10n("SAVE_ERROR"))
        }
    }

    push(password = null, index = null) {
        if (password === null) {
            password = {
                account: "",
                password: "",
                website: [],
                date: ""
            }
        }
        let nav_buttons = [
            {
                type: "button",
                props: {
                    symbol: "doc.on.doc",
                    tintColor: this.factory.text_color,
                    bgcolor: $color("clear")
                },
                layout: make => {
                    make.right.inset(60)
                    make.size.equalTo(20)
                },
                events: {
                    tapped: () => {
                        if (password.password === "") {
                            $ui.toast($l10n("NO_PASSWORD"))
                        } else {
                            $clipboard.text = password.password
                            $ui.toast($l10n("COPY_SUCCESS"))
                        }
                    }
                }
            },
            {
                type: "button",
                props: {
                    symbol: "checkmark",
                    tintColor: this.factory.text_color,
                    bgcolor: $color("clear")
                },
                layout: make => {
                    make.right.inset(10)
                    make.size.equalTo(20)
                },
                events: {
                    tapped: () => {
                        password.account = $("account").text.trim()
                        password.password = $("password").text.trim()
                        password.website = $("website").data
                        password.date = new Date().toLocaleDateString()
                        let is_update = false
                        if (undefined !== password.id) {
                            is_update = true
                        }
                        this.save(password, is_update, index)
                    }
                }
            }
        ]
        let views = [
            {
                type: "label",
                props: {
                    text: $l10n("ACCOUNT"),
                    textColor: this.factory.text_color,
                    align: $align.left,
                    font: $font(16),
                    line: 1
                },
                layout: make => {
                    make.left.inset(10)
                    make.width.equalTo(60)
                    make.height.equalTo(40)
                    make.top.equalTo(40)
                }
            },
            {
                type: "input",
                props: {
                    id: "account",
                    align: $align.left,
                    insets: 0,
                    text: password.account,
                    placeholder: $l10n("ACCOUNT"),
                    textColor: this.factory.text_color
                },
                layout: (make, view) => {
                    make.right.inset(10)
                    make.left.inset(60)
                    make.height.top.equalTo(view.prev)
                },
                events: {
                    returned: sender => {
                        sender.blur()
                    }
                }
            },
            {
                type: "label",
                props: {
                    text: $l10n("PASSWORD"),
                    textColor: this.factory.text_color,
                    align: $align.left,
                    font: $font(16),
                    line: 1
                },
                layout: (make, view) => {
                    make.left.inset(10)
                    make.width.equalTo(60)
                    make.height.equalTo(view.prev)
                    make.top.equalTo(view.prev).offset(40 + 30)
                }
            },
            {
                type: "input",
                props: {
                    id: "password",
                    align: $align.left,
                    text: password.password,
                    placeholder: $l10n("PASSWORD"),
                    textColor: this.factory.text_color
                },
                layout: (make, view) => {
                    make.right.inset(10)
                    make.left.inset(60)
                    make.height.equalTo(view.prev)
                    make.top.equalTo(view.prev)
                },
                events: {
                    returned: sender => {
                        sender.blur()
                    }
                }
            },
            {
                type: "list",
                props: {
                    id: "website",
                    reorder: false,
                    header: {
                        type: "label",
                        props: {
                            height: 20,
                            text: $l10n("WEBSITE"),
                            align: $align.left,
                            textColor: this.factory.text_color,
                            font: $font(12)
                        }
                    },
                    data: password.website,
                    actions: [{ title: "delete" }]
                },
                layout: (make, view) => {
                    make.left.right.inset(10)
                    make.bottom.inset(10)
                    make.centerY.equalTo(view.super).multipliedBy(1.5)
                }
            },
            {
                type: "button",
                props: {
                    symbol: "plus",
                    tintColor: this.factory.text_color,
                    bgcolor: $color("clear")
                },
                layout: (make, view) => {
                    make.right.inset(10)
                    make.size.equalTo(30)
                    make.centerY.equalTo(view.super).offset(20)
                },
                events: {
                    tapped: sender => {
                        $ui.popover({
                            sourceView: sender,
                            sourceRect: sender.bounds,
                            directions: $popoverDirection.down,
                            size: $size(320, 150),
                            views: [
                                {
                                    type: "input",
                                    props: {
                                        id: "website_inbox",
                                        type: $kbType.url,
                                        align: $align.left,
                                        placeholder: $l10n("WEBSITE")
                                    },
                                    layout: make => {
                                        make.left.right.inset(10)
                                        make.top.inset(20)
                                        make.height.equalTo(40)
                                    },
                                    events: {
                                        returned: sender => {
                                            if (sender.text === "") return
                                            let website = $("website")
                                            website.insert({
                                                index: website.data.length,
                                                value: sender.text
                                            })
                                            sender.blur()
                                            sender.text = ""
                                        }
                                    }
                                },
                                {
                                    type: "button",
                                    props: {
                                        symbol: "plus",
                                        tintColor: this.factory.text_color,
                                        bgcolor: $color("clear")
                                    },
                                    layout: make => {
                                        make.right.inset(10)
                                        make.size.equalTo(30)
                                        make.bottom.inset(40)
                                    },
                                    events: {
                                        tapped: () => {
                                            let website_inbox = $("website_inbox")
                                            if (website_inbox.text === "") return
                                            let website = $("website")
                                            website.insert({
                                                index: website.data.length,
                                                value: website_inbox.text
                                            })
                                            website_inbox.blur()
                                            website_inbox.text = ""
                                        }
                                    }
                                }
                            ]
                        })
                    }
                }
            }
        ]
        this.factory.push(views, $l10n("BACK"), nav_buttons)
    }
}

module.exports = EditorUI