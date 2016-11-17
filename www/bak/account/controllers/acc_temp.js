/*注册页面
先验证是否已经登陆，如果已经登陆则自动注销当前用户
*/

(function () {
    'use strict';

    var ctrlrName = 'acc_profile';

    _app.controller(ctrlrName, fn);

    function fn($rootScope, $scope, $location, $anchorScroll, $element, $mdToast, $mdDialog) {
        $rootScope[ctrlrName] = $scope;
        $scope.ctrlrName = ctrlrName;
        $scope.autoRun = []; //自动运行的函数

        _fns.getCtrlrAgs($scope, $element);


        $scope.user = {};

        //登录后把数据同步到$scope.user
        _global.promiseRun(function (tm) {
            _fns.applyScope($scope, function () {
                $scope.user = _global.myUsrInfo;
                if (!$scope.user.color) $scope.user.color = $scope.defaultColors[0];
                $scope.user.avatarCss = 'url(' + $scope.user.avatar + '-avatar128)';
            })
        }, function () {
            return _global.hasLogin;
        });

        //需要载入的内容，仅限延迟使用，即时使用的需要加入index.html
        _fns.addLib('md5');

        //换页
        $scope.goPage = function (pname) {
            $rootScope.changePage(pname);
        };

        //生成avatar的样式
        $scope.getAvatarCss = function (url) {
            return {
                'background': 'url(' + url + ')'
            }
        };



        //颜色预选
        $scope.defaultColors = ['#00BFA5', '#C51162', '#0D47A1', '#33691E', '#B71C1C', '#FF6D00', '#4E342E', '#37474F']


        //模拟input弹窗选择文件并开始上传
        $scope.upFile = {};
        $scope.uploadAvatar = function (evt) {

            var btnjo = $(evt.target);
            if (btnjo.attr('id') != 'uploadBtn') btnjo = btnjo.parent();

            $scope.uploadId = _fns.uploadFile2(btnjo,
                function (f, res) {
                    //before,
                },
                function (f, proevt) {
                    //progress,更新进度条
                    _fns.applyScope($scope, function () {
                        $scope.upFile.id = f;
                        $scope.uploading = true;
                    });
                },
                function (f, res) {
                    //sucess,从upFiles里面移除这个f
                    f.url = res.url;

                    //提示成功
                    _fns.applyScope($scope, function () {
                        $scope.user.avatar = res.file_path;
                        $scope.user.avatarCss = 'url(' + res.file_path + '-avatar128)';
                        $scope.uploading = false;
                    });
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('上传成功！')
                        .position('top right')
                        .hideDelay(3000)
                    );
                },
                function (f, err) {
                    //error,从upFiles里面移除这个f
                    f.url = res.url;
                    //提示成功
                    _fns.applyScope($scope, function () {
                        $scope.uploading = false;
                    });
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('上传失败:' + err.message)
                        .position('top right')
                        .hideDelay(3000)
                    );
                });
        };


        //注销当前账号
        $scope.loginOut = function () {
            var api = _global.api('acc_loginOut');
            var dat = {
                phone: $scope.user.phone
            };

            $.post(api, dat, function (res) {
                console.log('POST', api, dat, res);
                if (res.code == 1) {
                    $scope.hasLogin = false;
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('注销成功！')
                        .position('top right')
                        .hideDelay(500)
                    ).then(function (result) {
                        _global.myUsrInfo = undefined;
                        _global.hasLogin = false;
                        $scope.goPage('acc_login');
                    });
                } else {
                    //提示错误
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('注销失败:' + res.text)
                        .position('top right')
                        .hideDelay(3000)
                    );
                }
            });
        };

        //保存信息
        $scope.saveProfile = function () {
            var api = _global.api('acc_saveProfile');
            var dat = {
                nick: $scope.user.nick,
                color: $scope.user.color,
                icon: $scope.user.icon,
                avatar: $scope.user.avatar,
            };

            $.post(api, dat, function (res) {
                console.log('POST', api, dat, res);
                if (res.code == 1) {
                    //如果保存成功，提示然后返回okUrl或者back
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('保存成功！')
                        .position('top right')
                        .hideDelay(500)
                    ).then(function (result) {
                        if ($scope.args.okUrl) {
                            window.location.href = encodeURI($scope.args.okUrl);
                        } else {
                            window.location.href = document.referrer;
                        };
                    });
                } else {
                    //如果保存失败，提示
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('保存失败:' + res.text)
                        .position('top right')
                        .hideDelay(3000)
                    );
                }
            });
        };

        //跳转到修改密码页面，传递okUrl过去
        $scope.gotoChangePw = function () {
            if ($scope.args.okUrl) {
                var gourl = _cfg.homePath + '?page=acc_changePw&okUrl=' + encodeURI($scope.args.okUrl)
                window.location.href = gourl;
            } else {
                $scope.goPage('acc_changePw');
            };
        };

        //取消注册
        $scope.cancel = function () {
            window.location.href = document.referrer;
        };


        //自动运行的函数
        for (var attr in $scope.autoRun) {
            var fn = $scope.autoRun[attr];
            try {
                fn();
            } catch (err) {
                console.log(ctrlrName + ':' + fn.name + ' auto run failed...');
            }
        };

        //end
        console.log(ctrlrName + '.js loading...')
    };
})();
