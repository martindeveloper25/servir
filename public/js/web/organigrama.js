var codigo = 0;
var sentencia_crud = '';
$(document).ready(function () {

    //Ocultar el botón listar puestos y nuevo puesto;
    $("#nuevoPuesto").hide();
    $("#grabarPuestos").hide();
    
    //Si en el proyecto no se tiene previamente el mapa de puestos, no se debe mostrar 
    //el campo de número correlativo
    if ($("#mapaPuesto").val() == 1) {
        $("#tabla").DataTable().column(3).visible( false );
    }
    
    $('#tabla').on('change', 'tr td select', function () {

        var id = ($(this).attr("id"));
        var valor = $(this).val();
        var result = id.split('_');
        var tipo = result[0];
        var num = result[1];
        //Llenar familia y limpiar rol
        if (tipo == 'grupo') {
            $.ajax({
                url: urls.siteUrl + '/admin/organigrama/obtener-familias',
                data: {
                    grupo: valor
                },
                type: 'post',
                dataType: 'json',
                success: function (result) {
                    //Llenar familia
                    $("#familia_" + num).empty().append("<option value=''>Familia</option>");
                    $("#rol_" + num).empty().append("<option value=''>Rol</option>");
                    $.each(result, function (key, obj) {
                        $("#familia_" + num).append("<option value='" + obj['codigo_familia'] + "'>" + obj['descripcion'] + "</option>");
                    });
                }
            });
        }

        //Llenar roles y limpiar rol
        if (tipo == 'familia') {
            $.ajax({
                url: urls.siteUrl + '/admin/organigrama/obtener-roles',
                data: {
                    familia: valor
                },
                type: 'post',
                dataType: 'json',
                success: function (result) {
                    //Llenar rol
                    $("#rol_" + num).empty().append("<option value=''>Rol</option>");
                    $.each(result, function (key, obj) {
                        $("#rol_" + num).append("<option value='" + obj['codigo_rol_puesto'] + "'>" + obj['descripcion'] + "</option>");
                    });
                }
            });
        }
    });

    //Personalizar el listado de órganos
    $("#organo_chzn").css('width', '420px');
    $("#organo_chzn .chzn-drop").css('width', '410px');
    $("#organo_chzn .chzn-drop .chzn-search input").css('width', '360px');

    $("#unidad_chzn").css('width', '300px');
    $("#unidad_chzn .chzn-drop").css('width', '290px');
    $("#unidad_chzn .chzn-drop .chzn-search input").css('width', '240px');

    $("#nuevoPuesto").click(function () {

        var numReg = ($('#tabla').DataTable().data().count() / 9) + 1;
        var organo = $("#organo").val();
        var unidad = $("#unidad").val();
        
        if (organo == '') {
            alert("Seleccione órgano");return false;
        }
        
        if (unidad == '') {
            alert("Seleccione unidad orgánica");return false;
        }

        $('#tabla').DataTable().row.add([
            numReg,
            "<input type=hidden name=id_puesto value=0>" + $("#organo option:selected").text(),
            $("#unidad option:selected").text(),
            "<input type=number name=num_cor title='Ingrese el número correlativo del puesto' style='width:50%'>",
            "<input type=textarea name=puesto>",
            "<input type=number name=cantidad style='width:50%'>",
            "<select style='width:90%' id=grupo_" + numReg + " name=grupo_" + numReg + "><option value=''>[Grupo]</option></select>",
            "<select style='width:90%' id=familia_" + numReg + " name=familia><option value=''>[Familia]</option></select>",
            "<select style='width:90%' id=rol_" + numReg + " name=rol><option value=''>[Rol]</option></select><input type=hidden name=unidadT value='"+unidad+"'>"
        ]).draw(false);

        $.ajax({
            url: urls.siteUrl + '/admin/organigrama/obtener-grupos',
            type: 'post',
            dataType: 'json',
            success: function (result) {
                //Llenar familia
                $.each(result, function (key, obj) {
                    $("#grupo_" + numReg).append("<option value='" + obj['codigo_grupo'] + "'>" + obj['descripcion'] + "</option>");
                });
            }
        });
    });
    
    grabarPuestos = function () {
        
        var mapaPuesto = $("#mapaPuesto").val();
        var control = 0;
        if ($('#tabla').DataTable().data().count() == 0) {
            alert('No existen puestos para grabar');
            return false;
        }
        
        if (mapaPuesto == 1) {
            control = 1;
        }
        
        var dataPuesto = new Array();
        var dataNueva = new Array();
        var validar = '';
        var contador = 0;
        var mensaje = '';
        var mostrarMensaje = 0;
        
        $("#tabla tbody tr").each(function () {
            contador++;
            var id_puesto = $(this).find("td input").val();
            //Se muestra cuando si tiene mapa de puesto, agregar condicional
            var correlativo = $(this).find("td input").eq(1-control).val(); 
            var nom_puesto = $(this).find("td input").eq(2-control).val();
            var cantidad = $(this).find("td input").eq(3-control).val();
            var grupo = $(this).find("td select").eq(0).val();
            var familia = $(this).find("td select").eq(1).val();
            var rol = $(this).find("td select").eq(2).val();
            var unidad = $(this).find("td input").eq(4-control).val();
            
            
            if (mapaPuesto == 0) {
               if ((correlativo == '' || correlativo == 0) || nom_puesto == '' || 
                        (cantidad == '' || cantidad == 0) || grupo == '' || familia == '' || rol == '') {
                    mensaje += "En la fila " + contador +": Debe completar todos los campos \n";
                    mostrarMensaje = 1;
                } 
            } else if (mapaPuesto == 1) {
                if (nom_puesto == '' || (cantidad == '' || cantidad == 0) || grupo == '' || familia == '' || rol == '') {
                    mensaje += "En la fila " + contador +": Debe completar todos los campos \n";
                    mostrarMensaje = 1;
                }    
                correlativo = '';
            }
            
            if (id_puesto == 0) {
                dataNueva.push(id_puesto + "|" + correlativo + '|' + nom_puesto + '|' + cantidad
                    + "|" + grupo + "|" + familia + "|" + rol + "|" + unidad); 
            } else {
               dataPuesto.push(id_puesto + "|" + correlativo + '|' + nom_puesto + '|' + cantidad
                    + "|" + grupo + "|" + familia + "|" + rol + "|" + unidad); 
            }
        });
        
        //Mostrar mensaje si existen datos por completar
        if (mostrarMensaje == 1) {
            alert(mensaje);
            return false;
        }
        
        //console.log(data);
        $.ajax({
            url: urls.siteUrl + '/admin/organigrama/grabar-puestos',
            data: {
                puestos: dataPuesto,
                nuevo: dataNueva
            },
            type: 'post',
            dataType: 'json',
            success: function (result) {
                alert(result);
                //No refrescar página, sino actualizar con ajac los id
                var organo = $("#organo").val();
                    var unidad = $("#unidad").val();
                    var nomunidad = $("#unidad option:selected").text();

                    if (organo == '') {
                        alert('Seleccione órgano');
                        $('#tabla').DataTable().clear().draw();
                        return false;
                    }
                    if (unidad == '') {
                        $('#tabla').DataTable().clear().draw();
                        return false;
                    }
                    //Buscar y pintar la tabla de los puestos obtenidos
                    $.ajax({
                        url: urls.siteUrl + '/admin/organigrama/obtener-puestos',
                        data: {
                            unidad: unidad
                        },
                        type: 'post',
                        dataType: 'json',
                        success: function (result) {

                            var html = '';
                            var contador = 0;

                             if (result == '' || result == []) {
                             alert('No existen puestos, ingrese Nuevos puestos');
                             $('#tabla').DataTable().clear().draw();
                             return false;
                             }

                            $('#tabla').DataTable().clear().draw();
                            $.each(result, function (key, obj) {
                                contador++;
                                $('#tabla').DataTable().row.add([
                                    contador,
                                    "<input type=hidden name=id_puesto value='" + obj['id_puesto'] + "'>" + obj['organo'],
                                    obj['unidad'],
                                    "<input type=number name=num_cor value='" + obj['numcor'] + "' style='width:50%'>",
                                    "<input type=textarea name=puesto class='puesto_validate' value='" + obj['puesto'] + "'>",
                                    "<input type=number name=cantidad value='" + obj['cantidad'] + "' style='width:50%'>",
                                    obj['grupo'],
                                    obj['familia'],
                                    obj['rpuesto'] + "<input type=hidden name=unidadT value='"+unidad+"'>"
                                ]).draw(false);
                            });
                        }
                    });
                //location.reload();
            }
        });
    };
    
    //Actualizar las tablas de los órganos y las unidades orgánicas
    grabarDatos = function (tipo) {

        var data = new Array();
        var validar = '';
        $("#tabla" + tipo + " tbody tr").each(function () {
            var id = $(this).attr("data-" + tipo);
            var descripcion = $(this).find("td input").eq(1).val();
            var idp = $(this).find("td select").eq(0).val();
            validar = $(this).find("td").eq(0).text();
            data.push(id + "|" + descripcion + "|" + idp);
        });

        //if (validar == 'No hay registros' || validar == 'No hay datos en la tabla') {
        if ($('#tabla'+tipo).DataTable().data().count() == 0) {
            alert("No hay registros que actualizar");
            return false;
        }

        $.ajax({
            url: urls.siteUrl + '/admin/organigrama/grabar/tipo/' + tipo,
            data: {
                datos: data
            },
            type: 'post',
            dataType: 'json',
            success: function (result) {
                alert(result);
                //location.reload();
            }
        });

    };

    $("#organo").change(function () {

        var organo = $("#organo").val();
        if (organo == '') {
            return false;
        }
        
        $('#tabla').DataTable().clear().draw();
        //Realizar ajax para buscar unidades orgánicas
        $.ajax({
            url: urls.siteUrl + '/admin/organigrama/obtener-uorganica',
            data: {
                organo: organo
            },
            type: 'post',
            //Probar generando el html
            success: function (result) {
                $("#capa").html(result);
                $("#nuevoPuesto").show();
                $("#grabarPuestos").show();
                
                $("#unidad").change(function(){
                    
                    var organo = $("#organo").val();
                    var unidad = $("#unidad").val();
                    var nomunidad = $("#unidad option:selected").text();

                    if (organo == '') {
                        alert('Seleccione órgano');
                        $('#tabla').DataTable().clear().draw();
                        return false;
                    }
                    if (unidad == '') {
                        $('#tabla').DataTable().clear().draw();
                        return false;
                    }
                    //Buscar y pintar la tabla de los puestos obtenidos
                    $.ajax({
                        url: urls.siteUrl + '/admin/organigrama/obtener-puestos',
                        data: {
                            unidad: unidad
                        },
                        type: 'post',
                        dataType: 'json',
                        success: function (result) {

                            var html = '';
                            var contador = 0;

                             if (result == '' || result == []) {
                             alert('No existen puestos, ingrese Nuevos puestos');
                             $('#tabla').DataTable().clear().draw();
                             return false;
                             }

                            $('#tabla').DataTable().clear().draw();
                            $.each(result, function (key, obj) {
                                contador++;
                                $('#tabla').DataTable().row.add([
                                    contador,
                                    "<input type=hidden name=id_puesto value='" + obj['id_puesto'] + "'>" + obj['organo'],
                                    obj['unidad'],
                                    "<input type=number name=num_cor value='" + obj['numcor'] + "' style='width:50%'>",
                                    "<input type=textarea name=puesto class='puesto_validate' value='" + obj['puesto'] + "'>",
                                    "<input type=number name=cantidad value='" + obj['cantidad'] + "' style='width:50%'>",
                                    obj['grupo'],
                                    obj['familia'],
                                    obj['rpuesto'] + "<input type=hidden name=unidadT value='"+unidad+"'>"
                                ]).draw(false);
                            });
                        }
                    });
                });  
            }
        });
    });

    $('#tablaorgano').dataTable({
        "bJQueryUI": true,
        // searching: false,
        // paging: true,
        // scrollY: 400,
        "sPaginationType": "full_numbers"
                // "sDom": "<'row'<'span6'l><'span6'f>r>t<'row'<'span6'i><'span6'p>>"
                //"sDom": '<""l>t<"F"fp>'
    });
    
    $('#tablaunidad').dataTable({
        "bJQueryUI": true,
        "sPaginationType": "full_numbers"
                // "sDom": "<'row'<'span6'l><'span6'f>r>t<'row'<'span6'i><'span6'p>>"
                //"sDom": '<""l>t<"F"fp>'
    });

    configModal = function (id, ope, titulo, tipo) {

        var controlador = 'organigrama';
        var codigo = id;
        var sentencia_crud = ope;
        $.ajax({
            url: urls.siteUrl + '/admin/' + controlador + '/operacion/ajax/form/tipo/' + tipo,
            data: {id: id},
            type: 'post',
            success: function (result) {

                $('#ventana-modal').empty().html(result);
                $(".v_numeric").numeric();
                $(".v_decimal").numeric(',');
                $(".v_datepicker").datepicker({
                    changeMonth: true,
                    changeYear: true
                });

                $('#ventana-modal').dialog({
                    height: 'auto',
                    width: 620,
                    modal: true,
                    resizable: false,
                    title: titulo,
                    buttons: {
                        "Guardar": function () {
                            dialog = $(this);
                            $.ajax({
                                url: urls.siteUrl + '/admin/' + controlador + '/operacion/ajax/validar/tipo/' + tipo,
                                data: $('#form').serialize(),
                                type: 'post',
                                success: function (result) {
                                    if (validarCampos(result)) {
                                        $.ajax({
                                            url: urls.siteUrl + '/admin/' + controlador + '/operacion/ajax/save/scrud/' + sentencia_crud + '/id/' + codigo + '/tipo/' + tipo,
                                            data: $("#form").serialize(),
                                            success: function (result) {
                                                location.reload();
                                            }
                                        });
                                    }
                                }
                            })
                        },
                        "Cancelar": function () {
                            $(this).dialog("close");
                        }
                    },
                    close: function () {
                    }
                });
            }
        })
    };

    nuevoRegistro = function (tipo) {
        /*var table = $('#tablaorgano').DataTable();
         table.search('Despacho');
         table.draw();*/
        configModal(0, 'nuevo', 'Nuevo registro', tipo);
    };

    editarRegistro = function (id, tipo) {
        configModal(id, 'edit', 'Editar registro', tipo);
    };
    
    eliminaRegistro = function(id, tipo){
        
        codigo = id;
   
                $('#ventana-modal').empty().html('¿Está seguro que desea eliminar registro?');
                $('#ventana-modal').dialog({
                height: 'auto',
                width: 350, 
                modal: true,
                resizable: false,
                title:'Mensaje del sistema',
                buttons: {
                    "Eliminar": function() {
                    dialog = $(this);
                    $.ajax({
                        url: urls.siteUrl + '/admin/organigrama/operacion/ajax/delete',
                        data:{id:codigo,tipo:tipo},
                        type: 'post',
                        dataType: 'json',
                        success: function(result){
                            
                            //Verificar si se actualizó
                            if (result.code == 0) {
                                alert(result.msg);
                                return false;
                            }
                            location.reload();
                        }
                    });
                    },
                     "Cancelar": function() {
                       $(this).dialog("close"); 
                    }
                },
                close: function() {//$("#ventana-modal").remove();
                }
                });
         
    };


})
