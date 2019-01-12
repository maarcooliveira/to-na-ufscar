var sections = ["#grades", "#group", "#course", "#results"];
var cursos;
var grupo;

$(document).ready(function () {
    $('select').material_select();

    $.ajax({
        type: "GET",
        url: "./data/dados-cursos.csv",
        dataType: "text",
        success: function (data) {
            cursos = Papa.parse(data, {
                header: true
            });
            cursos = cursos.data;
        }
    });

    $('#campus').on('change', function () {
        $("#btn-confirm-course").addClass("disabled");
        var selecionado = $(this).val();
        $('#cursos')
            .empty()
            .append('<option value=\'\' disabled selected>Escolha um curso</option>');

        for (i in cursos) {
            if (cursos[i].campus === selecionado) {
                $('#cursos').append($('<option>', {
                    value: cursos[i].curso,
                    text: cursos[i].curso
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
            }
            else {
                dest = $(this.hash).offset().top - 100;
            }

            for (i in sections) {
                if (sections[i] !== next) {
                    $(sections[i]).fadeOut("slow", function () {
                    });
                }
            }
            $('html,body').animate({ scrollTop: 0 }, 500, 'swing', function () {
            });
            $(next).fadeIn("slow", function () { });
        }

    });

    $('#cursos').on('change', function () {
        $("#btn-confirm-course").removeClass("disabled");
    });

});

function setGroup(groupId) {
    grupo = groupId;
    $('#btn-confirm-group').click();
    ga('send', 'event', 'app', 'setGroup', grupo);
};

function showResults() {
    var n_linguagens = $('#n_linguagens').val();
    var n_humanas = $('#n_humanas').val();
    var n_natureza = $('#n_natureza').val();
    var n_matematica = $('#n_matematica').val();
    var n_redacao = $('#n_redacao').val();
    var campus = $('#campus').val();
    var curso = $('#cursos').val();
    var gp = "g" + grupo;
    var id;

    for (i in cursos) {
        if (cursos[i].campus === campus && cursos[i].curso === curso) {
            id = i;
        }
    }

    var soma_pesos = Number(cursos[id].humanas) + Number(cursos[id].linguagens) + Number(cursos[id].matematica) + Number(cursos[id].natureza) + Number(cursos[id].redacao);
    var media_aluno = ((cursos[id].humanas * n_humanas) + (cursos[id].linguagens * n_linguagens) + (cursos[id].matematica * n_matematica) + (cursos[id].natureza * n_natureza) + (cursos[id].redacao * n_redacao)) / soma_pesos;

    ga('send', 'event', 'app', 'viewResults', curso, grupo, {
        'dimension1': campus,
        'metric1': media_aluno
    });

    var cidade = "sao-carlos"
    if (campus === "Sorocaba") {
        cidade = "sorocaba";
    }
    else if (campus === "Araras") {
        cidade = "araras";
    }
    else if (campus === "Lagoa do Sino") {
        cidade = "lagoa-do-sino"
    }

    var ac_corte = "<td><i class=\"fa fa-check fa-lg good\"></i> Acima da nota de corte</td>";
    var ac_min = "<td><i class=\"fa fa-check fa-lg med\"></i> Acima da nota mínima</td>";
    var ab_min = "<td><i class=\"fa fa-times fa-lg bad\"></i> Abaixo da nota mínima</td>";

    $("#tabela_res").html("");

    get_dados("2018");

    $('#course').css('display', 'none');

    function get_dados(ano) {
        $.ajax({
            type: "GET",
            url: "./data/" + ano + "-" + cidade + ".csv",
            dataType: "text",
            success: function (data) {
                $('#results').css('display', 'inline-block');
                $('#nome_curso').text(curso);
                $('#nome_campus').text('UFSCar ' + campus);
                dados = Papa.parse(data, {
                    header: true
                });
                d = dados.data;

                for (i in d) {
                    if (d[i].curso === curso) {
                        new_tr = "<tr>"
                        new_tr += "<td>" + ano + "</td>"
                        new_tr += "<td>" + d[i][gp + '-sisu'] + "</td>"
                        new_tr += "<td>" + d[i][gp + '-maior'] + "</td>"
                        new_tr += "<td>" + d[i][gp + '-menor'] + "</td>"
                        new_tr += "<td>" + media_aluno.toFixed(2) + "</td>"
                        if (media_aluno >= d[i][gp + '-sisu'])
                            new_tr += ac_corte;
                        else if (media_aluno >= d[i][gp + '-menor'])
                            new_tr += ac_min;
                        else
                            new_tr += ab_min;
                        new_tr += "</tr>"
                        $("#tabela_res").append(new_tr);
                    }
                }


                if (ano === "2018") {
                    get_dados("2017")
                } else if (ano === "2017") {
                    get_dados("2016");
                } else if (ano === "2016") {
                    get_dados("2015");
                } else if (ano === "2015") {
                    get_dados("2014");
                } else if (ano === "2014") {
                    get_dados("2013");
                }
            }
        });
    }

}
