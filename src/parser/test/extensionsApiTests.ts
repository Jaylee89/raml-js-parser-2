import assert = require("assert")
import RamlWrapper = require("../artifacts/raml10parserapi")
import RamlWrapperImpl = require("../artifacts/raml10parser")
import apiLoader = require("../apiLoader")
import hl = require("../../parser/highLevelAST")
import path = require("path")


describe('Extension API', function () {
    this.timeout(15000);
    it('Api', function (done) {
        var opt = apiLoader.loadApi(
            path.resolve(__dirname,"./data/extensions/librarybooks_spain.raml"));

        // var opt = apiLoader.loadApi1(path.resolve(__dirname,"./data/helperTestApi.raml"));
        assert(opt.isDefined());
        assert(RamlWrapperImpl.ApiImpl.isInstance(opt.getOrThrow()));
        var api:RamlWrapper.Api = <RamlWrapper.Api>opt.getOrThrow();

        assert(api != null);
        assert(api.wrapperClassName() === "OverlayImpl");

        var overlay = <RamlWrapper.Overlay>api;
        assert(overlay.extends() === "librarybooks.raml");

        var pathToRes = overlay.highLevel().lowLevel().unit().absolutePath();
        var newPath = path.resolve(path.dirname(pathToRes), overlay.extends());

        var opt2 = apiLoader.loadApi(newPath);
        assert(opt2.isDefined());
        assert(RamlWrapperImpl.ApiImpl.isInstance(opt2.getOrThrow()));
        var api2 = <RamlWrapper.Api>opt2.getOrThrow();

        assert(api2 != null);
        assert(api2.wrapperClassName() === "ApiImpl");

        var hl2 = api2.highLevel();

        function goOn(node: hl.IHighLevelNode, lvl: number) {
            var spacing = new Array(lvl).join("\t");
            console.log(node.printDetails("\t"));
            console.log(spacing, hl.NodeKind[node.getKind()], "::", node.name(), "=>", node.value());

            node.attrs().forEach(att => {
                console.log(spacing + "--", hl.NodeKind[att.getKind()], "::", att.name(), "=>", att.value());
            });

            node.elements().forEach(el => {
               goOn(el, lvl+1);
            });
        }
        goOn(hl2.copy(), 0);
        // overlay.highLevel().

        done();
    });

    //it('Api.allBaseUriParameters()', function () {
    //
    //    var baseUriParameters = api.allBaseUriParameters();
    //    assert(baseUriParameters.length==3);
    //});

});
