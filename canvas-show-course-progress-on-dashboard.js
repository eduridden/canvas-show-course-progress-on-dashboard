/*
 * canvas-show-course-progress-on-dashboard.js
 * by: Spencer Lawson slawson@instructure.com
 * by: Danny Wahl danny@instructure.com
 * Adds a current progress and expected progress
 * bar to the course tile.  Current progress is
 * based on the module requirements and expectedProgress
 * progress is as a percentage of total course time.
 */

$(function(){
    console.log("Checking path...");
    if(window.location.pathname == "/") {

        console.log("User is on dashboard, continuing...");
        var domain = window.location.hostname;
        var currentProgressJsonURL = "https://" + domain + ":443/api/v1/courses?include[]=course_progress&enrollment_type=student";
        var progressData = {};
        var currentProgress = null;
        var expectedProgress = null;

        var toPercent = function(value) {
            console.log("converting value to percentage");
            if(value < 1) {
                var percentage = value * 100;
            } else {
                console.log("number is > 1, returning whole number.");
            }
            console.log("returning percentage");
            return percentage;
        }

        var insertCurrentProgress = function(course, progress) {
            var currentProgressMeter = '<div id="progressbar"><div class="progress--current"></div></div>';
            var currentProgressColor = "#0c0";
            var courseID = course;
            var progress = toPercent(progress);
            var currentProgressAsPercent = progress + "%";

            console.log("adding current progress meter");
            $('div[data-reactid=".0.$' + courseID + '"]').append(currentProgressMeter);

            console.log("remove bottom border on course tile")
            $('div[data-reactid=".0.$' + courseID + '"]').css({
                'border-bottom-color': '#fff',
            });

            console.log("styling progress meter container");
            $('#progressbar').css({
                'height': '0px'
            });

            console.log("styling current progress bar")
            $('.progress--current').css({
                'width': currentProgressAsPercent,
                'height': '4px',
                'position': 'relative',
                'bottom': '4px',
                'background-color': currentProgressColor,
            }).attr({
                'title': 'Current progress: ' + currentProgressAsPercent,
                'data-tooltip': '{"tooltipClass":"popover popover-padded", "position":"bottom"}',
            });

            console.log("adding current progress hover events");
            /* TODO: fix hover states
            $('.progress--current').hover(function(){
                $(this).css({
                    'height': '8px',
                    'bottom': '8px',
                });
            },
            function(){
                $(this).css({
                    'height': '4px',
                    'bottom': '0px',
                });
            });
            */

        }

        var insertExpectedProgress = function(course, progress) {
            var expectedProgressMeter = '<div class="progress--expected"></div>';
            var expectedProgressColor = "#ccc";
            var progress = toPercent(progress);
            var courseID = course;
            var expectedProgressAsPercent = progress + "%";

            console.log("Adding expected progress meter");
            $('.progress--current').before(expectedProgressMeter);

            console.log("Styling expected progress meter");
            $('.progress--expected').css({
                'width': expectedProgressAsPercent,
                'height': '4px',
                'position': 'relative',
                'bottom': '0px',
                'background-color': expectedProgressColor,
            }).attr({
                'title': 'Expected progress: ' + expectedProgressAsPercent,
                'data-tooltip': '{"tooltipClass":"popover popover-padded", "position":"bottom"}',
            });

            console.log("adding expected progress hover events");
            /* TODO: fix hover states
            $('.progress--expected').hover(function(){
                $(this).css({
                    'height': '8px',
                    'bottom': '4px',
                });
            },
            function(){
                $(this).css({
                    'height': '4px',
                    'bottom': '0px',
                });
            });
            */

        }

        var calculateExpectedProgress = function(start, end) {

            var startTime = Date.parse(start);
            var startTimeMS = startTime.getTime();
            console.log(startTimeMS);

            var endTime = Date.parse(end);
            var endTimeMS = endTime.getTime();
            console.log(endTimeMS);

            var now = new Date();
            var nowMS = now.getTime();
            console.log(nowMS);

            console.log("calculating expected progress");
            var progress = (nowMS - startTimeMS) / (endTimeMS - startTimeMS);
            console.log(progress);

            if(progress > 0) {
                return progress;
            } else {
                console.log("Course dates error, not displaying expected progress");
                /* TODO: fix positioning
                console.log("repositoning current progress bar");
                $('.progress--current').addClass("without_expected--progress");
                $('.progress--current.without_expected--progress').css({
                    'bottom': '0px',
                });
                $('.progress--current.without_expected--progress').hover(function(){
                    $(this).css({
                        'height': '8px',
                        'bottom': '4px',
                    });
                },
                function(){
                    $(this).css({
                        'height': '4px',
                        'bottom': '0px',
                    });
                });
                */

                return 0;
            }
        }

        console.log("Getting course progress");
        var getCurrentProgress = $.getJSON(currentProgressJsonURL, function(data) {
            progressData = data;
            console.log(progressData);
        });

        getCurrentProgress.success(function(){
            console.log("course progress received, checking progress");
            if(progressData.length > 0) {
                $.each(progressData, function(idx, course){

                    console.log("Checking if course " + course.id + " has progress...");
                    currentProgress = course.course_progress.requirement_completed_count / course.course_progress.requirement_count;

                    if(isNaN(currentProgress)) {
                        console.log("Course Progress not enabled for current course, skipping...");
                    } else {
                        console.log("course has progress, adding current progress");
                        console.log(course);
                        insertCurrentProgress(course.id, currentProgress);

                        if(course.hasOwnProperty("start_at") && course.hasOwnProperty("end_at") && course.start_at != null && course.end_at != null) {
                            expectedProgress = calculateExpectedProgress(course.start_at, course.end_at);
                            insertExpectedProgress(course.id, expectedProgress);
                        } else {
                            console.log("Course does not have start/end dates, won't add expected progress.");
                        }
                    }
                });
            } else {
                console.log("No courses found with progress data, exiting.");
            }
        });

        getCurrentProgress.error(function(){
            console.log("error getting course progress, exiting");
        });

    } else {
        console.log("user not on dashboard, exiting.");
    }
});
