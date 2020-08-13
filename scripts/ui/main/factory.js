class Factory {
    constructor(kernel) {
        this.kernel = kernel
        this.selected_page = 0 // 首页屏幕 0首页 1储藏室 2设置
        this.menu_data = [
            {
                icon: {
                    image: $image("assets/icon/password.png", "assets/icon/password-dark.png")
                },
                title: {
                    text: $l10n("PASSWORD"),
                    textColor: $color("primaryText")
                }
            },
            {
                icon: {
                    image: $image("assets/icon/storage.png", "assets/icon/storage-dark.png")
                },
                title: {
                    text: $l10n("STORAGE"),
                    textColor: $color("primaryText")
                }
            },
            {
                icon: {
                    image: $image("assets/icon/setting.png", "assets/icon/setting-dark.png")
                },
                title: {
                    text: $l10n("SETTING"),
                    textColor: $color("primaryText")
                }
            }
        ]
    }

    menu() {
        for (let i = 0; i < this.menu_data.length; i++) {
            if (this.selected_page === i) {
                this.menu_data[i].icon["alpha"] = 1
                this.menu_data[i].title["alpha"] = 1
            }
        }
        return {
            type: "matrix",
            props: {
                id: "menu",
                columns: this.menu_data.length,
                itemHeight: 50,
                spacing: 0,
                scrollEnabled: false,
                bgcolor: $color("clear"),
                template: [
                    {
                        type: "image",
                        props: {
                            id: "icon",
                            bgcolor: $color("clear"),
                            alpha: 0.5
                        },
                        layout: (make, view) => {
                            make.centerX.equalTo(view.super)
                            make.size.equalTo(25)
                            make.top.inset(7)
                        },
                    },
                    {
                        type: "label",
                        props: {
                            id: "title",
                            font: $font(10),
                            alpha: 0.5
                        },
                        layout: (make, view) => {
                            make.centerX.equalTo(view.prev)
                            make.bottom.inset(5)
                        }
                    }
                ],
                data: this.menu_data,
            },
            layout: (make, view) => {
                make.top.inset(0)
                if ($device.info.screen.width > 500) {
                    make.width.equalTo(500)
                } else {
                    make.left.right.inset(0)
                }
                make.centerX.equalTo(view.super)
                make.height.equalTo(50)
            },
            events: {
                didSelect: (sender, indexPath) => {
                    let new_data = []
                    for (let i in sender.data) {
                        let tmp = sender.data[i]
                        if (Number(i) === indexPath.item) {
                            tmp.title["alpha"] = 1
                            tmp.icon["alpha"] = 1
                        } else {
                            tmp.title["alpha"] = 0.5
                            tmp.icon["alpha"] = 0.5
                        }
                        new_data.push(tmp)
                    }
                    this.menu_data = new_data
                    this.selected_page = indexPath.item
                    this.render()
                }
            }
        }
    }

    creator(views, events) {
        $ui.render({
            type: "view",
            props: {
                navBarHidden: true,
                statusBarStyle: 0,
            },
            layout: $layout.fillSafeArea,
            views: [
                {
                    type: "view",
                    props: {
                        clipsToBounds: true,
                    },
                    layout: make => {
                        make.top.inset(20)
                        make.left.right.bottom.inset(0)
                    },
                    views: views
                },
                {
                    type: "view",
                    layout: (make, view) => {
                        make.top.equalTo(view.super.safeAreaBottom).offset(-50)
                        make.bottom.left.right.inset(0)
                    },
                    views: [
                        {
                            type: "blur",
                            props: {
                                style: $blurStyle.thinMaterial,
                            },
                            layout: $layout.fill,
                        },
                        this.menu()
                    ],
                },
                {
                    type: "canvas",
                    layout: (make, view) => {
                        make.top.equalTo(view.prev.top)
                        make.height.equalTo(1 / $device.info.screen.scale)
                        make.left.right.inset(0)
                    },
                    events: {
                        draw: (view, ctx) => {
                            let width = view.frame.width
                            let scale = $device.info.screen.scale
                            ctx.strokeColor = $color("gray")
                            ctx.setLineWidth(1 / scale)
                            ctx.moveToPoint(0, 0)
                            ctx.addLineToPoint(width, 0)
                            ctx.strokePath()
                        }
                    }
                }
            ],
            events: events
        })
    }

    render() {
        const create_home = () => {
            const { HomeUI } = require("./home")
            let ui_interface = new HomeUI(this.kernel)
            this.creator(ui_interface.get_views(), ui_interface.get_events())
        }
        const create_storage = () => {
            const { StorageUI } = require("./storage")
            let ui_interface = new StorageUI(this.kernel)
            this.creator(ui_interface.get_views(), ui_interface.get_events())
        }
        const create_setting = () => {
            const { SettingUI } = require("./setting")
            let ui_interface = new SettingUI(this.kernel)
            this.creator(ui_interface.get_views(), ui_interface.get_events())
        }
        switch (this.selected_page) {
            case 0: // 首页
                create_home()
                break
            case 1: // 储藏室
                create_storage()
                break
            case 2: // 设置
                create_setting()
                break
            default:
                return
        }
    }
}

module.exports = {
    Factory: Factory
}