var sections = ["#grades", "#group", "#course", "#results"];
var firstYear = 2013;
var lastYear = 2018;
var courses;
var group;

$(document).ready(function () {
    $('select').material_select();

    $.ajax({
        type: "GET",
        url: "./data/dados-cursos.csv",
        dataType: "text",
        success: function (data) {
            courses = Papa.parse(data, {
                header: true
            });
            courses = courses.data;
        }
    });

    $('#campus').on('change', function () {
        $("#btn-confirm-course").addClass("disabled");
        var selecionado = $(this).val();
        $('#cursos')
            .empty()
            .append('<option value=\'\' disabled selected>Escolha um curso</option>');

        for (i in courses) {
            if (courses[i].campus === selecionado) {
                $('#cursos').append($('<option>', {
                    value: courses[i].curso,
                    text: courses[i].curso
                }));
            }
        }
        $('select').material_select();
    });

    // $('#grades').css('display', 'none');
    $('#group').css('display', 'none');
    $('#course').css('display', 'none');
    $('#results').css('display', 'none');

    // Smooth scroll
    $(".inner-nav").click(function (event) {
        event.preventDefault();

        if (!$(this).hasClass("disabled")) {
            next = this.getAttribute('href');
            $(next).css('display', 'inline-block');

            var dest = 0;

            if ($(this.hash).offset().top > $(document).height() - $(window).height()) {
                dest = $(document).height() - $(window).height();
            } else {
                dest = $(this.hash).offset().top - 100;
            }

            for (i in sections) {
                if (sections[i] !== next) {
                    $(sections[i]).fadeOut("slow", function () {
                    });
                }
            }
            $('html,body').animate({ scrollTop: 0 }, 500, 'swing', function () {});
            $(next).fadeIn("slow", function () { });
        }

    });

    $('#cursos').on('change', function () {
        $("#btn-confirm-course").removeClass("disabled");
    });

});

function setGroup(groupId) {
    group = groupId;
    $('#btn-confirm-group').click();
    ga('send', 'event', 'app', 'setGroup', group);
};

function showResults() {
    var languageGrade = $('#n_linguagens').val();
    var humanGrade = $('#n_humanas').val();
    var natureGrade = $('#n_natureza').val();
    var mathGrade = $('#n_matematica').val();
    var essayGrade = $('#n_redacao').val();
    var campus = $('#campus').val();
    var course = $('#cursos').val();
    var gp = "g" + group;
    var id;

    for (i in courses) {
        if (courses[i].campus === campus && courses[i].curso === course) {
            id = i;
        }
    }

    var weightSum = Number(courses[id].humanas) + Number(courses[id].linguagens) + Number(courses[id].matematica) + Number(courses[id].natureza) + Number(courses[id].redacao);
    var studentGrade = ((courses[id].humanas * humanGrade) + (courses[id].linguagens * languageGrade) + (courses[id].matematica * mathGrade) + (courses[id].natureza * natureGrade) + (courses[id].redacao * essayGrade)) / weightSum;

    ga('send', 'event', 'app', 'viewResults', course, group, {
        'dimension1': campus,
        'metric1': studentGrade
    });

    var city = "sao-carlos"
    if (campus === "Sorocaba") {
        city = "sorocaba";
    }
    else if (campus === "Araras") {
        city = "araras";
    }
    else if (campus === "Lagoa do Sino") {
        city = "lagoa-do-sino"
    }

    var aboveCut = "<td><i class=\"fa fa-check fa-lg good\"></i> Acima da nota de corte</td>";
    var aboveMin = "<td><i class=\"fa fa-check fa-lg med\"></i> Acima da nota mínima</td>";
    var belowMin = "<td><i class=\"fa fa-times fa-lg bad\"></i> Abaixo da nota mínima</td>";

    $("#tabela_res").html("");

    getData(lastYear);

    $('#course').css('display', 'none');

    function getData(year) {
        $.ajax({
            type: "GET",
            url: "./data/" + year + "-" + city + ".csv",
            dataType: "text",
            success: function (data) {
                $('#results').css('display', 'inline-block');
                $('#nome_curso').text(course);
                $('#nome_campus').text('UFSCar ' + campus);
                dados = Papa.parse(data, {
                    header: true
                });
                d = dados.data;

                for (i in d) {
                    if (d[i].curso === course) {
                        row = "<tr>"
                        row += "<td>" + year + "</td>"
                        row += "<td>" + d[i][gp + '-sisu'] + "</td>"
                        row += "<td>" + d[i][gp + '-maior'] + "</td>"
                        row += "<td>" + d[i][gp + '-menor'] + "</td>"
                        row += "<td>" + studentGrade.toFixed(2) + "</td>"
                        if (studentGrade >= d[i][gp + '-sisu']) {
                            row += aboveCut;
                        } else if (studentGrade >= d[i][gp + '-menor']) {
                            row += aboveMin;
                        } else {
                            row += belowMin;
                        }
                        row += "</tr>"
                        $("#tabela_res").append(row);
                    }
                }
                
                if (year > firstYear) {
                    getData(--year)
                }
            }
        });
    }

}
